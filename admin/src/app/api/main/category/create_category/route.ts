import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import dbConnection from "@/config/db";
import { ICategory } from "@/migrations/Migration";
import { z } from "zod";
import { OkPacket } from "mysql2";
import { authMiddleware } from "@/middlewares/authMiddleware";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Input Validation Schema
const categorySchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters"),
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req);
    if (authResult.status !== 200) return authResult;

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json(responseStructure(false, "Invalid Form Data"), { status: 400 });
    }

    const parsedData = categorySchema.safeParse({ name });
    if (!parsedData.success) {
      return NextResponse.json(responseStructure(false, "Invalid Form Data", parsedData.error.errors), { status: 400 });
    }

    const mysqlDb = await dbConnection;
    const [rows] = await mysqlDb.execute(`SELECT * FROM \`categories\` WHERE name=?`, [name]);

    if ((rows as ICategory[]).length > 0) {
      return NextResponse.json(responseStructure(false, "Category already exists with the same name"), { status: 400 });
    }

    let uploadedImageUrl = "";
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      
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
      uploadedImageUrl = extractedPath;
    }

    const result = await mysqlDb.execute(
      `INSERT INTO \`categories\` (name, image, is_active) VALUES (?, ?, 1)`,
      [name, uploadedImageUrl]
    ) as OkPacket[];

    if (result[0].affectedRows === 0) {
      return NextResponse.json(responseStructure(false, "Something Went Wrong"), { status: 400 });
    }

    return NextResponse.json(responseStructure(true, "Successfully Created Category"), { status: 201 });
  } catch (error) {
    return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
  }
}
