import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { z } from "zod";
import { IOrder } from "@/interfaces/modelInterface";
import { RowDataPacket } from "mysql2";

// Define validation schema
const orderUpdateSchema = z.object({
    id: z.number({ invalid_type_error: "Order ID must be a number" }).positive(),
    status: z.enum(["Cancelled", "Returned"]),
});

export async function POST(req: NextRequest) {
    try {
        // Authenticate user
        const user = await authMiddleware(req);
        if (user instanceof NextResponse) {
            return user; // Return 401 Unauthorized if user is not authenticated
        }

        const body = await req.json();
        const parsedData = orderUpdateSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json(responseStructure(false, "Invalid Form Data", parsedData.error.format()), { status: 400 });
        }

        const { id, status } = parsedData.data;

        const mysqlDb = await dbConnection;

        // Check if order exists for the user
        const [rows] = await mysqlDb.execute(`SELECT * FROM orders WHERE id=? AND user_id=?`, [id, user.id]);

        if (!(rows as IOrder[]).length) {
            return NextResponse.json(responseStructure(false, "No Order found"), { status: 404 });
        }

        // Update order status
        const [result] = await mysqlDb.execute(
            `UPDATE orders SET status=? WHERE id=? AND user_id=?`,
            [status, id, user.id]
        ) as RowDataPacket[];

        if (result.affectedRows === 0) {
            return NextResponse.json(responseStructure(false, "No changes were made to the order"), { status: 400 });
        }

        return NextResponse.json(responseStructure(true, "Successfully Updated Order"), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}