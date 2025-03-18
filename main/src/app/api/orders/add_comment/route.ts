import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

const commentSchema = z.object({
    order_id: z.number({ invalid_type_error: "Order ID must be a number" }).positive(),
    comment: z.string({ invalid_type_error: "Comment must be a string" }).min(3, "Comment must be at least 3 characters"),
});

export async function POST(req: NextRequest) {
    try {
        const user = await authMiddleware(req);
        if (user instanceof NextResponse) {
            return user;
        }

        const body = await req.json();
        const parsedData = commentSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json(responseStructure(false, "Invalid Data", parsedData.error.format()), { status: 400 });
        }

        const { order_id, comment } = parsedData.data;
        const mysqlDb = await dbConnection;

        const [orderRows] = await mysqlDb.execute(
            `SELECT id, product_id, user_id, status FROM orders WHERE id = ? AND is_active = 1`,
            [order_id]
        ) as RowDataPacket[];

        if (orderRows.length === 0) {
            return NextResponse.json(responseStructure(false, "Order not found"), { status: 404 });
        }

        const order = orderRows[0] as { id: number; product_id: number; user_id: number; status: string };

        if (order.status !== "Delivered") {
            return NextResponse.json(responseStructure(false, "You can only comment on delivered orders"), { status: 400 });
        }

        await mysqlDb.execute(
            `INSERT INTO comments (order_id, product_id, user_id, comment, is_active, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [order.id, order.product_id, user.id, comment, 1]
        );

        return NextResponse.json(responseStructure(true, "Comment added successfully"), { status: 201 });

    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}