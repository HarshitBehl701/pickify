import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin, ISubCategory } from "@/migrations/Migration";
import { RowDataPacket, OkPacket } from "mysql2";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { authMiddleware } from "@/middlewares/authMiddleware";

const uploadDir = path.join(process.cwd(), "public/assets/mainAssets/main");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export const config = {
    api: {
        bodyParser: false,
    },
};

// Input Validation Schema
const subCategorySchema = z.object({
    category_id: z.string(),
    name: z.string().min(3, "Sub-category name must be at least 3 characters"),
});

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req) as { success: boolean, admin: IAdmin };

        if (!authResult.success) {
            return NextResponse.json(responseStructure(false, "Unauthorized"), { status: 401 });
        }

        const formData = await req.formData();
        const category_id = formData.get("category_id") as string;
        const name = formData.get("name") as string;
        const imageFile = formData.get("image") as File | null;

        if (!category_id || !name) {
            return NextResponse.json(responseStructure(false, "Invalid Form Data"), { status: 400 });
        }

        const parsedData = subCategorySchema.safeParse({ category_id, name });
        if (!parsedData.success) {
            return NextResponse.json(responseStructure(false, "Invalid Form Data", parsedData.error.errors), { status: 400 });
        }

        const mysqlDb = await dbConnection;

        // Check if Category Exists
        const [categoryExists] = await mysqlDb.execute(
            `SELECT id FROM \`categories\` WHERE id=?`,
            [parseInt(category_id)]
        ) as RowDataPacket[];

        if ((categoryExists as ISubCategory[]).length === 0) {
            return NextResponse.json(responseStructure(false, "Category Not Found"), { status: 404 });
        }

        // Check if Subcategory Exists
        const [subCategoryExists] = await mysqlDb.execute(
            `SELECT id FROM \`sub_categories\` WHERE category_id=? AND name=?`,
            [parseInt(category_id), name]
        ) as RowDataPacket[];

        if ((subCategoryExists as ISubCategory[]).length > 0) {
            return NextResponse.json(responseStructure(false, "Sub-category already exists"), { status: 400 });
        }

        let uploadedFileName = "";
        if (imageFile) {
            const fileExtension = path.extname(imageFile.name);
            const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
            const filePath = path.join(uploadDir, uniqueFileName);
            const buffer = Buffer.from(await imageFile.arrayBuffer());

            fs.writeFileSync(filePath, buffer);
            uploadedFileName = uniqueFileName;
        }

        // Insert into Database
        const result = await mysqlDb.execute(
            `INSERT INTO \`sub_categories\` (category_id, name, image, is_active) VALUES (?, ?, ?, 1)`,
            [parseInt(category_id), name, uploadedFileName]
        ) as OkPacket[];

        if (result[0].affectedRows === 0) {
            return NextResponse.json(responseStructure(false, "Something Went Wrong"), { status: 400 });
        }

        return NextResponse.json(responseStructure(true, "Successfully Created Sub-category"), { status: 201 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}