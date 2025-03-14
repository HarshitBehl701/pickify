import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IUser } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { z } from "zod";

const schema = z.object({
    id: z.number(),
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
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`users\` WHERE id=?`, [id]);

        if (!(rows as IUser[]).length) {
            return res.status(404).json(responseStructure(false, "No user found"));
        }

        const userAccount: IUser = (rows as IUser[])[0];

        return res.status(200).json(responseStructure(true, "Successfully fetch User Account",{userAccount}));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);