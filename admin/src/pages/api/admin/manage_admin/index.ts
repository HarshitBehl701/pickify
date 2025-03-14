import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

// Define validation schema
const schema = z.object({
    id: z.number(),
    name: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long").optional(),
    is_active: z.number().optional(),
});


async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const parseResult = schema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json(responseStructure(false, "Invalid input", parseResult.error.format()));
        }

        const { id, name, email, password, is_active } = parseResult.data;

        const allowedFields: { [key: string]: string | number | undefined } = { name, password };

        const updateRequestFields = Object.fromEntries(
            Object.entries(allowedFields).filter(([, value]) => value !== undefined)
        );

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`admins\` WHERE id=?`, [id]);

        if (!(rows as IAdmin[]).length) {
            return res.status(404).json(responseStructure(false, "No admin found"));
        }

        const adminAccount: IAdmin = (rows as IAdmin[])[0];

        if (email && adminAccount.email !== email) {
            const [emailRows] = await mysqlDb.execute(
                `SELECT * FROM \`admins\` WHERE email=? AND id!=? AND is_active=?`,
                [email, id, 1]
            );

            if ((emailRows as IAdmin[]).length > 0) {
                return res.status(404).json(responseStructure(false, "Admin Already Exists With Same Email"));
            } else updateRequestFields.email = email;
        }

        if (is_active !== undefined) {
            updateRequestFields.is_active = is_active;
        }

        const fields: string = Object.keys(updateRequestFields)
            .map((key) => ` \`${key}\`=? `)
            .join(",");

        const result = (await mysqlDb.execute(
            `UPDATE \`admins\` SET ${fields} WHERE id=?`,
            [...Object.values(updateRequestFields), id]
        )) as RowDataPacket;

        if (result.affectedRows == 0)
            return res.status(400).json(responseStructure(false, "Something Went Wrong"));

        return res.status(200).json(responseStructure(true, "Successfully Updated Admin Account"));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);
