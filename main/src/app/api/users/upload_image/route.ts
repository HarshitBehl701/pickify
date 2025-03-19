import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { authMiddleware } from "@/middlewares/authMiddleware";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) {
      return user; // Return 401 Unauthorized if user is not authenticated
    }

    if (!user) {
      return NextResponse.json(responseStructure(false, "Unauthorized"), { status: 401 });
    }

    // Parse formData from the request
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(responseStructure(false, "No file uploaded"), { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        { folder: process.env.CLOUDINARY_USER_FOLDER, public_id: `user_${user.id}_${Date.now()}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Extract Cloudinary URL and Public ID
    const { secure_url } = uploadResponse as { secure_url: string; public_id: string };

    const extractedPath = secure_url.replace(/^.*\/upload\//, "");

    // Delete old image if exists (from Cloudinary)
    if (user.image) {
      try {
        const publicId = user.image.replace(/^v\d+\//, "").replace(/\.[^.]+$/, "");
    
        await cloudinary.v2.uploader.destroy(publicId);
      } catch (error) {
        console.error("Failed to delete old Cloudinary image:", error);
      }
    }

    // Update database with Cloudinary image URL & Public ID
    const mysqlConnection = await dbConnection;
    await mysqlConnection.execute(`UPDATE users SET image=? WHERE id=?`, [
      extractedPath,
      user.id,
    ]);

    return NextResponse.json(responseStructure(true, "Successfully updated profile photo"), { status: 200 });
  } catch (error) {
    return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
  }
}