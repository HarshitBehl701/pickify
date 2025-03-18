import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin, ISubCategory } from "@/migrations/Migration";
import { RowDataPacket, OkPacket } from "mysql2";
import { z } from "zod";
import { authMiddleware } from "@/middlewares/authMiddleware";

// Validation Schema
const updateSubCategorySchema = z.object({
    sub_category_id: z.number().positive("Invalid sub-category ID"),
    name: z.string().min(3, "Sub-category name must be at least 3 characters"),
    is_active: z.number().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req) as { success: boolean, admin: IAdmin };
        if (!authResult.success) {
            return NextResponse.json(responseStructure(false, "Unauthorized"), { status: 401 });
        }

        const body = await req.json();
        const parsedData = updateSubCategorySchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json(responseStructure(false, "Invalid Form Data", parsedData.error.errors), { status: 400 });
        }

        const { sub_category_id, name, is_active } = parsedData.data;
        const mysqlDb = await dbConnection;

        // Check if sub-category exists
        const [existingSubCategory] = await mysqlDb.execute(
            `SELECT * FROM \`sub_categories\` WHERE id=?`, 
            [sub_category_id]
        ) as RowDataPacket[];

        if ((existingSubCategory as ISubCategory[]).length === 0) {
            return NextResponse.json(responseStructure(false, "Sub-category not found"), { status: 404 });
        }

        const category_id = (existingSubCategory as ISubCategory[])[0].category_id;

        // Check for duplicate sub-category name in the same category
        const [duplicateCheck] = await mysqlDb.execute(
            `SELECT id FROM \`sub_categories\` WHERE name=? AND category_id=? AND id!=?`,
            [name, category_id, sub_category_id]
        ) as RowDataPacket[];

        if ((duplicateCheck as ISubCategory[]).length > 0) {
            return NextResponse.json(responseStructure(false, "Sub-category already exists with the same name"), { status: 400 });
        }

        // Update the sub-category
        const result = await mysqlDb.execute(
            `UPDATE \`sub_categories\` SET name=?, is_active=? WHERE id=?`,
            [name, is_active, sub_category_id]
        ) as OkPacket[];

        if (result[0].affectedRows === 0) {
            return NextResponse.json(responseStructure(false, "Something went wrong"), { status: 400 });
        }

        return NextResponse.json(responseStructure(true, "Successfully updated sub-category"), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}