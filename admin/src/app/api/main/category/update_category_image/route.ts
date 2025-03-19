import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import dbConnection from "@/config/db";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { ICategory } from "@/migrations/Migration";

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
        const [categoryRows] = await mysqlConnection.execute("SELECT * FROM `categories` WHERE id=?", [parseInt(id as string)]);

        if ((categoryRows as ICategory[]).length === 0) {
            return NextResponse.json(responseStructure(false, "No category found"), { status: 404 });
        }

        const category = (categoryRows as ICategory[])[0];

        // Delete old image from Cloudinary if exists
        if (category.image) {
            const publicId = (category.image as string).replace(/^v\d+\//, "").replace(/\.[^.]+$/, "");
            await cloudinary.v2.uploader.destroy(publicId);
        }

        // Upload new image to Cloudinary
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload_stream(
                { folder: process.env.CLOUDINARY_CATEGORIES_FOLDER, public_id: `category_${Date.now()}` },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        const { secure_url } = uploadResponse as { secure_url: string };
        const extractedPath = secure_url.replace(/^.*\/upload\//, "");

        // Update category image in database
        await mysqlConnection.execute("UPDATE `categories` SET `image`=? WHERE id=?", [extractedPath, parseInt(id as string)]);

        return NextResponse.json(responseStructure(true, "Successfully updated category"), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};