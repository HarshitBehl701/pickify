import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IProduct } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket, OkPacket } from "mysql2";
import { z } from "zod";  // Import Zod for validation

// Define validation schema
const productUpdateSchema = z.object({
    id: z.number({ invalid_type_error: "Product ID must be a number" }).positive(),
    name: z.string().min(3, "Name must be at least 3 characters").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    specification: z.string().optional(),
    category: z.number({ invalid_type_error: "Category ID must be a number" }).positive().optional(),
    sub_category: z.string().optional(),
    price: z.number({ invalid_type_error: "Price must be a valid number" }).positive().optional(),
    discount: z.number().min(0, "Discount cannot be negative").optional(),
    is_active: z.number().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const parsedData = productUpdateSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json(responseStructure(false, "Invalid Form Data",parsedData.error.format()));
        }

        const { id, name, description, specification, category, sub_category, price, discount, is_active } = parsedData.data;

        console.log(req.body);

        const allowedFields = { name, description, specification, price, discount, is_active };
        const updateRequestFields = Object.fromEntries(Object.entries(allowedFields).filter(([, value]) => value !== undefined));

        const mysqlDb = await dbConnection;

        const [rows] = await mysqlDb.execute(`SELECT * FROM \`products\` WHERE id=?`, [id]) as RowDataPacket[];
        if (!(rows as IProduct[]).length) {
            return res.status(404).json(responseStructure(false, "No Product found"));
        }

        const product: IProduct = (rows as IProduct[])[0];

        if (category && product.category as unknown  as number !== category) {
            const [categoryRows] = await mysqlDb.execute(`SELECT id FROM \`categories\` WHERE id=?`, [category]) as RowDataPacket[];
            if (!(categoryRows as IProduct[]).length) {
                return res.status(404).json(responseStructure(false, "No Category found"));
            }
            updateRequestFields.category = category;
        }

        if (sub_category && product.sub_category as  unknown as string !== sub_category) {
            const [subCategoryRows] = await mysqlDb.execute(
                `SELECT id FROM \`sub_categories\` WHERE id=?`,
                [sub_category]
            ) as RowDataPacket[];

            if (!(subCategoryRows as IProduct[]).length) {
                return res.status(404).json(responseStructure(false, "No Category found"));
            }

            updateRequestFields.sub_category = sub_category;
        }

        const fields: string = Object.keys(updateRequestFields).map((key) => `\`${key}\`=?`).join(",");
        const result = await mysqlDb.execute(
            `UPDATE \`products\` SET ${fields} WHERE id=?`,
            [...Object.values(updateRequestFields), id]
        ) as OkPacket[];

        if (result[0].affectedRows === 0) {
            return res.status(400).json(responseStructure(false, "No changes were made to the product"));
        }

        return res.status(200).json(responseStructure(true, "Successfully Updated Product"));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);