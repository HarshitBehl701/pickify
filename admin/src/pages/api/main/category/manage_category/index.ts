import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { ICategory } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket, OkPacket } from "mysql2";
import { z } from "zod";

const categorySchema = z.object({
    id: z.number().positive("Invalid category ID"),
    name: z.string().min(3, "Category name must be at least 3 characters").optional(),
    is_active: z.number().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const parsedData = categorySchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json(responseStructure(false,"Invalid  Data",parsedData.error.errors));
        }

        const { id, name, is_active } = parsedData.data;
        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`categories\` WHERE id=?`, [id]) as RowDataPacket[];

        if ((rows as ICategory[]).length === 0) {
            return res.status(404).json(responseStructure(false, "No Category found"));
        }

        const category: ICategory = (rows as ICategory[])[0];

        if (name && name !== category.name) {
            const [existing] = await mysqlDb.execute(`SELECT * FROM \`categories\` WHERE name=? AND id!=?`, [name, id]) as RowDataPacket[];
            if ((existing as ICategory[]).length > 0) {
                return res.status(400).json(responseStructure(false, "Category already exists with the same name"));
            }
        }

        const allowedFields = { name, is_active };
        const updateRequestFields = Object.fromEntries(Object.entries(allowedFields).filter(([, value]) => value !== undefined));

        if (Object.keys(updateRequestFields).length === 0) {
            return res.status(400).json(responseStructure(false, "No updates provided"));
        }

        const fields = Object.keys(updateRequestFields).map((key) => `\`${key}\`=?`).join(",");
        const result = await mysqlDb.execute(`UPDATE \`categories\` SET ${fields} WHERE id=?`, [...Object.values(updateRequestFields), id]) as OkPacket[];

        if (result[0].affectedRows === 0) {
            return res.status(400).json(responseStructure(false, "Something went wrong"));
        }

        return res.status(200).json(responseStructure(true, "Successfully updated category"));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);