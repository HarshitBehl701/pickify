import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin, IProduct } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket, OkPacket } from "mysql2";
import { z } from "zod";

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

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req) as { success: boolean; admin: IAdmin };
        if (!authResult.success) {
            return NextResponse.json(responseStructure(false, "Unauthorized"), { status: 401 });
        }

        const body = await req.json();
        const parsedData = productUpdateSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json(responseStructure(false, "Invalid Form Data", parsedData.error.format()), { status: 400 });
        }

        const { id, name, description, specification, category, sub_category, price, discount, is_active } = parsedData.data;
        
        const allowedFields = { name, description, specification, price, discount, is_active };
        const updateRequestFields = Object.fromEntries(Object.entries(allowedFields).filter(([, value]) => value !== undefined));

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`products\` WHERE id=?`, [id]) as RowDataPacket[];
        if (!(rows as IProduct[]).length) {
            return NextResponse.json(responseStructure(false, "No Product found"), { status: 404 });
        }

        const product: IProduct = (rows as IProduct[])[0];

        if (category && (product.category as unknown as number) !== category) {
            const [categoryRows] = await mysqlDb.execute(`SELECT id FROM \`categories\` WHERE id=?`, [category]) as RowDataPacket[];
            if (!(categoryRows as IProduct[]).length) {
                return NextResponse.json(responseStructure(false, "No Category found"), { status: 404 });
            }
            updateRequestFields.category = category;
        }

        if (sub_category && (product.sub_category as unknown as string) !== sub_category) {
            const [subCategoryRows] = await mysqlDb.execute(`SELECT id FROM \`sub_categories\` WHERE id=?`, [sub_category]) as RowDataPacket[];
            if (!(subCategoryRows as IProduct[]).length) {
                return NextResponse.json(responseStructure(false, "No Category found"), { status: 404 });
            }
            updateRequestFields.sub_category = sub_category;
        }

        const fields: string = Object.keys(updateRequestFields).map((key) => `\`${key}\`=?`).join(",");
        const result = await mysqlDb.execute(
            `UPDATE \`products\` SET ${fields} WHERE id=?`,
            [...Object.values(updateRequestFields), id]
        ) as OkPacket[];

        if (result[0].affectedRows === 0) {
            return NextResponse.json(responseStructure(false, "No changes were made to the product"), { status: 400 });
        }

        return NextResponse.json(responseStructure(true, "Successfully Updated Product"), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}