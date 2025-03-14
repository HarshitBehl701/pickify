import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure, hashString } from "@/utils/commonUtils";
import { z } from "zod";
import { IUser } from "@/interfaces/modelInterface";

const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

        const [existingRows] = await mysqlDb.execute(`SELECT * FROM \`users\` WHERE email=?`, [email]);
        if ((existingRows as IUser[]).length) {
            return res.status(409).json(responseStructure(false, "Email is already in use"));
        }

        const hashedPassword = await hashString(password);
        
        await mysqlDb.execute(`INSERT INTO \`users\` (name, email, password, is_active) VALUES (?, ?, ?, 1)`,[name, email, hashedPassword]);
        
        return res.status(201).json(responseStructure(true, "Successfully Registered"));
    } catch (error) {
        console.log(error);
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}