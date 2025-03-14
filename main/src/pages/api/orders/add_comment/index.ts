import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

const commentSchema = z.object({
    order_id: z.number({ invalid_type_error: "Order ID must be a number" }).positive(),
    comment: z.string({ invalid_type_error: "Comment must be a string" }).min(3, "Comment must be at least 3 characters"),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const parsedData = commentSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json(responseStructure(false, "Invalid Data", parsedData.error.format()));
        }

        const { order_id, comment } = parsedData.data;
        const mysqlDb = await dbConnection;

        const [orderRows] = await mysqlDb.execute(
            `SELECT id, product_id, user_id, status FROM orders WHERE id = ? AND is_active = 1`,
            [order_id]
        ) as RowDataPacket[];

        if (orderRows.length === 0) {
            return res.status(404).json(responseStructure(false, "Order not found"));
        }

        const order = orderRows[0] as { id: number; product_id: number; user_id: number; status: string };

        if (order.status !== "Delivered") {
            return res.status(400).json(responseStructure(false, "You can only comment on delivered orders"));
        }

        await mysqlDb.execute(
            `INSERT INTO comments (order_id, product_id, user_id, comment, is_active, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [order.id, order.product_id, order.user_id, comment, 1]
        );

        return res.status(201).json(responseStructure(true, "Comment added successfully"));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);