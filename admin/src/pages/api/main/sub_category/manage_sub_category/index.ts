import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { ISubCategory } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket, OkPacket } from "mysql2";
import { z } from "zod";

const updateSubCategorySchema = z.object({
    sub_category_id: z.number().positive("Invalid sub-category ID"),
    name: z.string().min(3, "Sub-category name must be at least 3 characters"),
    is_active: z.number().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const parsedData = updateSubCategorySchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json(responseStructure(false, "Invalid  Form  data",parsedData.error.errors));
        }

        const { sub_category_id, name,is_active } = parsedData.data;
        const mysqlDb = await dbConnection;

        const [existingSubCategory] = await mysqlDb.execute(`SELECT * FROM \`sub_categories\` WHERE id=?`, [sub_category_id]) as RowDataPacket[];
        if ((existingSubCategory as ISubCategory[]).length === 0) {
            return res.status(404).json(responseStructure(false, "Sub-category not found"));
        }

        const category_id = (existingSubCategory as ISubCategory[])[0].category_id;

        const [duplicateCheck] = await mysqlDb.execute(
            `SELECT id FROM \`sub_categories\` WHERE name=? AND category_id=? AND id!=?`,
            [name, category_id, sub_category_id]
        ) as RowDataPacket[];

        if ((duplicateCheck as ISubCategory[]).length > 0) {
            return res.status(400).json(responseStructure(false, "Sub-category already exists with the same name"));
        }

        const result = await mysqlDb.execute(
            `UPDATE \`sub_categories\` SET name=?  ,  is_active=? WHERE id=?`,
            [name, is_active,sub_category_id]
        ) as OkPacket[];

        if (result[0].affectedRows === 0) {
            return res.status(400).json(responseStructure(false, "Something went wrong"));
        }

        return res.status(200).json(responseStructure(true, "Successfully updated sub-category"));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);