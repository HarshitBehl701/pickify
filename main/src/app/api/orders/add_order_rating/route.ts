import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

const ratingSchema = z.object({
    order_id: z.number({ invalid_type_error: "Order ID must be a number" }).positive(),
    rating: z.number({ invalid_type_error: "Rating must be a number" }).min(1).max(5),
});

export async function POST(req: NextRequest) {
    try {
        // Authenticate user
        const user = await authMiddleware(req);
        if (user instanceof NextResponse) {
            return user; // If middleware returns response (401, 404), return it immediately
        }

        const body = await req.json();
        const parsedData = ratingSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json(responseStructure(false, "Invalid Data", parsedData.error.format()), { status: 400 });
        }

        const { order_id, rating } = parsedData.data;
        const mysqlDb = await dbConnection;

        // Fetch order details
        const [orderRows] = await mysqlDb.execute(
            `SELECT id, product_id, rating FROM orders WHERE id = ? AND is_active = 1`,
            [order_id]
        ) as RowDataPacket[];

        if (orderRows.length === 0) {
            return NextResponse.json(responseStructure(false, "Order not found"), { status: 404 });
        }

        const order = orderRows[0] as { id: number; product_id: number; rating: number };

        // Fetch product details
        const [productRows] = await mysqlDb.execute(
            `SELECT id, sum_rating, number_of_users_rate FROM products WHERE id = ? AND is_active = 1`,
            [order.product_id]
        ) as RowDataPacket[];

        if (productRows.length === 0) {
            return NextResponse.json(responseStructure(false, "Product not found"), { status: 404 });
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

        // Update order rating
        await mysqlDb.execute(`UPDATE orders SET rating = ? WHERE id = ?`, [rating, order_id]);

        // Update product rating
        await mysqlDb.execute(
            `UPDATE products SET sum_rating = ?, number_of_users_rate = ?, average_rating = ? WHERE id = ?`,
            [newSumRating, newNumberOfUsersRate, newAverageRating, order.product_id]
        );

        return NextResponse.json(responseStructure(true, "Rating Updated Successfully"), { status: 200 });

    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}