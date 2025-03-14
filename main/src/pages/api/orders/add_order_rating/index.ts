import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

const ratingSchema = z.object({
    order_id: z.number({ invalid_type_error: "Order ID must be a number" }).positive(),
    rating: z.number({ invalid_type_error: "Rating must be a number" }).min(1).max(5),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const parsedData = ratingSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json(responseStructure(false, "Invalid Data", parsedData.error.format()));
        }

        const { order_id, rating } = parsedData.data;
        const mysqlDb = await dbConnection;

        const [orderRows] = await mysqlDb.execute(
            `SELECT id, product_id, rating FROM orders WHERE id = ? AND is_active = 1`,
            [order_id]
        ) as RowDataPacket[];

        if (orderRows.length === 0) {
            return res.status(404).json(responseStructure(false, "Order not found"));
        }

        const order = orderRows[0] as { id: number; product_id: number; rating: number };

        const [productRows] = await mysqlDb.execute(
            `SELECT id, sum_rating, number_of_users_rate FROM products WHERE id = ? AND is_active = 1`,
            [order.product_id]
        ) as RowDataPacket[];

        if (productRows.length === 0) {
            return res.status(404).json(responseStructure(false, "Product not found"));
        }

        const product = productRows[0] as { id: number; sum_rating: number; number_of_users_rate: number };

        let newSumRating = product.sum_rating;
        let newNumberOfUsersRate = product.number_of_users_rate;

        if (order.rating === 0) {
            newSumRating += rating;
            newNumberOfUsersRate += 1;
        } else {
            newSumRating = newSumRating - order.rating + rating;
        }

        const newAverageRating = newSumRating / newNumberOfUsersRate;
        
        await mysqlDb.execute(`UPDATE orders SET rating = ? WHERE id = ?`, [rating, order_id]);
        
        await mysqlDb.execute(
            `UPDATE products SET sum_rating = ?, number_of_users_rate = ?, average_rating = ? WHERE id = ?`,
            [newSumRating, newNumberOfUsersRate, newAverageRating, order.product_id]
        );

        return res.status(200).json(responseStructure(true, "Rating Updated Successfully"));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);