import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket, OkPacket } from "mysql2";
import { z } from "zod";
import { IAdmin, IOrder } from "@/migrations/Migration";

// Define validation schema
const orderUpdateSchema = z.object({
    id: z.number({ invalid_type_error: "Order ID must be a number" }).positive(),
    status: z.enum([
        "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded", "Failed", "On Hold", "Returned"
    ]).optional(),
    is_active: z.boolean().optional()
});

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req) as { success: boolean; admin: IAdmin };
        if (!authResult.success) {
            return NextResponse.json(responseStructure(false, "Unauthorized"), { status: 401 });
        }

        const body = await req.json();
        const parsedData = orderUpdateSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json(responseStructure(false, "Invalid Form Data", parsedData.error.format()), { status: 400 });
        }

        const { id, status, is_active } = parsedData.data;
        const updateRequestFields: Record<string, unknown> = {};
        if (status) updateRequestFields.status = status;
        if (typeof is_active !== "undefined") updateRequestFields.is_active = is_active;

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute("SELECT * FROM `orders` WHERE id=?", [id]) as RowDataPacket[];
        if (!(rows as IOrder[]).length) {
            return NextResponse.json(responseStructure(false, "No Order found"), { status: 404 });
        }

        const fields: string = Object.keys(updateRequestFields).map((key) => `\`${key}\`=?`).join(",");
        const result = await mysqlDb.execute(
            `UPDATE \`orders\` SET ${fields} WHERE id=?`,
            [...Object.values(updateRequestFields), id]
        ) as OkPacket[];

        if (result[0].affectedRows === 0) {
            return NextResponse.json(responseStructure(false, "No changes were made to the order"), { status: 400 });
        }

        return NextResponse.json(responseStructure(true, "Successfully Updated Order"), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}