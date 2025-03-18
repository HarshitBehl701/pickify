import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

const productViewSchema = z.object({
    product_id: z.number({ invalid_type_error: "Product ID must be a number" }).positive(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsedData = productViewSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json(responseStructure(false, "Invalid Data", parsedData.error.format()), { status: 400 });
        }

        const { product_id } = parsedData.data;
        const mysqlDb = await dbConnection;

        const [productRows] = await mysqlDb.execute(
            `SELECT id, views FROM products WHERE id = ? AND is_active = 1`,
            [product_id]
        ) as RowDataPacket[];

        if (productRows.length === 0) {
            return NextResponse.json(responseStructure(false, "Product not found"), { status: 404 });
        }

        await mysqlDb.execute(
            `UPDATE products SET views = views + 1 WHERE id = ?`,
            [product_id]
        );

        return NextResponse.json(responseStructure(true, "Product view count updated"), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}