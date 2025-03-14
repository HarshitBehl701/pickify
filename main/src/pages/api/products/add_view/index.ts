import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

const productViewSchema = z.object({
    product_id: z.number({ invalid_type_error: "Product ID must be a number" }).positive(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const parsedData = productViewSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json(responseStructure(false, "Invalid Data", parsedData.error.format()));
        }

        const { product_id } = parsedData.data;
        const mysqlDb = await dbConnection;

        const [productRows] = await mysqlDb.execute(
            `SELECT id, views FROM products WHERE id = ? AND is_active = 1`,
            [product_id]
        ) as RowDataPacket[];

        if (productRows.length === 0) {
            return res.status(404).json(responseStructure(false, "Product not found"));
        }

        await mysqlDb.execute(
            `UPDATE products SET views = views + 1 WHERE id = ?`,
            [product_id]
        );

        return res.status(200).json(responseStructure(true, "Product view count updated"));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default handler;