import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import dbConnection from "@/config/db";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { ISubCategory } from "@/migrations/Migration";
import { z } from "zod";
import { RowDataPacket, OkPacket } from "mysql2";

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
        const authResult = await authMiddleware(req);
        if (authResult.status !== 200) {
            return authResult;
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

        let uploadedImageUrl = "";
        if (imageFile) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const uploadResponse = await new Promise((resolve, reject) => {
                cloudinary.v2.uploader.upload_stream(
                    { folder: process.env.CLOUDINARY_SUB_CATEGORIES_FOLDER, public_id: `subcategory_${Date.now()}` },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });
            const { secure_url } = uploadResponse as { secure_url: string };
            const extractedPath = secure_url.replace(/^.*\/upload\//, "");
            uploadedImageUrl = extractedPath;
        }

        // Insert into Database
        const result = await mysqlDb.execute(
            `INSERT INTO \`sub_categories\` (category_id, name, image, is_active) VALUES (?, ?, ?, 1)`,
            [parseInt(category_id), name, uploadedImageUrl]
        ) as OkPacket[];

        if (result[0].affectedRows === 0) {
            return NextResponse.json(responseStructure(false, "Something Went Wrong"), { status: 400 });
        }

        return NextResponse.json(responseStructure(true, "Successfully Created Sub-category", { imageUrl: uploadedImageUrl }), { status: 201 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}