import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, hashString, responseStructure } from "@/utils/commonUtils";
import { IAdmin } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
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

        const { name, email, password } = parseResult.data;

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`admins\` WHERE email=?`, [email]);

        if ((rows as IAdmin[]).length) {
            return res.status(409).json(responseStructure(false, "Admin Already Exists With Same Email"));
        }

        const hashPassword: string = await hashString(password);

        const [result] = await mysqlDb.execute(
            `INSERT INTO \`admins\` (name, email, password, is_active) VALUES (?, ?, ?, ?)`,
            [name, email, hashPassword, 1]
        ) as RowDataPacket[];
        
        if (result.affectedRows === 0) {
            return res.status(400).json(responseStructure(false, "Something Went Wrong"));
        }

        return res.status(201).json(responseStructure(true, "Successfully Added New Admin"));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);