import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { z } from "zod";

const schema = z.object({
    id: z.string().min(1, "ID is required").regex(/^[0-9]+$/, "ID must be a numeric string"),
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
        
        const { id } = parseResult.data;
        const mysqlDb = await dbConnection;

        const [rows] = await mysqlDb.execute(`SELECT * FROM \`admins\` WHERE id=?`, [id]);

        if (!(rows as IAdmin[]).length) {
            return res.status(404).json(responseStructure(false, "No admin found"));
        }

        const admin: IAdmin = (rows as IAdmin[])[0];
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...adminDetails } = admin;
        return res.status(200).json(responseStructure(true, "Successfully fetched admin details", adminDetails));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);
