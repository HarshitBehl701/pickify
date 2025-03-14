import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IUser } from "@/interfaces/modelInterface";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

const schema = z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long").optional(),
    address: z.string().optional(),
    is_active: z.number().optional(), // Ensure is_active is a number
});

async function handler(req: ICustomApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const parseResult = schema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json(responseStructure(false, "Invalid input", parseResult.error.format()));
        }
        
        const user =  req.user;

        const { name, email, password,address, is_active } = parseResult.data;

        const allowedFields: { [key: string]: string | number | undefined } = { name, password,address };

        const updateRequestFields = Object.fromEntries(
            Object.entries(allowedFields).filter(([, value]) => value !== undefined)
        );

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`users\` WHERE id=?`, [user?.id]);

        if (!(rows as IUser[]).length) {
            return res.status(404).json(responseStructure(false, "No user found"));
        }

        const userAccount: IUser = (rows as IUser[])[0];

        if (email && userAccount.email !== email) {
            const [emailRows] = await mysqlDb.execute(
                `SELECT * FROM \`users\` WHERE email=? AND id!=? AND is_active=?`,
                [email, user?.id, 1]
            );

            if ((emailRows as IUser[]).length > 0) {
                return res.status(404).json(responseStructure(false, "User Already Exists With Same Email"));
            } else updateRequestFields.email = email;
        }

        if (is_active !== undefined) {
            updateRequestFields.is_active = is_active;
        }

        const fields: string = Object.keys(updateRequestFields)
            .map((key) => ` \`${key}\`=? `)
            .join(",");

        const result = (await mysqlDb.execute(
            `UPDATE \`users\` SET ${fields} WHERE id=?`,
            [...Object.values(updateRequestFields), user?.id]
        )) as RowDataPacket;

        if (result.affectedRows == 0)
            return res.status(400).json(responseStructure(false, "Something Went Wrong"));

        return res.status(200).json(responseStructure(true, "Successfully Updated User Account"));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);

interface ICustomApiRequest  extends NextApiRequest{
    user?:IUser
}