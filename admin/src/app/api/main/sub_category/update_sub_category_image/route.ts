import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import dbConnection from "@/config/db";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { ISubCategory } from "@/migrations/Migration";

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        // Authenticate user
        const authResult = await authMiddleware(req);
        if (authResult.status !== 200) return authResult;

        const formData = await req.formData();
        const id = formData.get("id");
        const file = formData.get("image") as File;

        if (!id || !file) {
            return NextResponse.json(responseStructure(false, "Missing required fields"), { status: 400 });
        }

        const mysqlConnection = await dbConnection;
        const [subCategoryRows] = await mysqlConnection.execute("SELECT * FROM `sub_categories` WHERE id=?", [parseInt(id as string)]);

        if ((subCategoryRows as ISubCategory[]).length === 0) {
            return NextResponse.json(responseStructure(false, "No sub-category found"), { status: 404 });
        }

        const subCategory = (subCategoryRows as ISubCategory[])[0];

        // Delete old image from Cloudinary if exists
        if (subCategory.image) {
            const publicId = (subCategory.image as string).replace(/^v\d+\//, "").replace(/\.[^.]+$/, "");
            await cloudinary.v2.uploader.destroy(publicId);
        }

        // Upload new image to Cloudinary
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload_stream(
                { folder: process.env.CLOUDINARY_SUB_CATEGORIES_FOLDER, public_id: `sub_category_${Date.now()}` },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        const { secure_url } = uploadResponse as { secure_url: string };
        const extractedPath = secure_url.replace(/^.*\/upload\//, "");

        // Update sub-category image in database
        await mysqlConnection.execute("UPDATE `sub_categories` SET `image`=? WHERE id=?", [extractedPath, parseInt(id as string)]);

        return NextResponse.json(responseStructure(true, "Successfully updated sub-category"), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};