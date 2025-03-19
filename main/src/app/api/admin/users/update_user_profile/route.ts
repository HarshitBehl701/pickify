import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import  jwt from "jsonwebtoken";
import { IUser } from "@/interfaces/modelInterface";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware: Authenticate Admin
async function authMiddleware(req: NextRequest) {
  try {
    const token = req.cookies.get("adminAuthToken")?.value;
    if (!token) {
      return NextResponse.json(responseStructure(false, "Unauthorized. Token missing."), { status: 401 });
    }

    const secret_key = process.env.SECRET_KEY || "pickify";
    const decoded = jwt.verify(token, secret_key) as { id: number };
    if (!decoded) {
      return NextResponse.json(responseStructure(false, "Unauthorized. Invalid token."), { status: 401 });
    }

    const mysqlConnection = await dbConnection;
    const [rows] = await mysqlConnection.execute(`SELECT * FROM \`admins\` WHERE id=?`, [decoded.id]);

    if ((rows as IUser[]).length === 0) {
      return NextResponse.json(responseStructure(false, "No Admin Found"), { status: 404 });
    }

    return { success: true };
  } catch (error) {
    return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResponse = await authMiddleware(req);
    if (authResponse instanceof NextResponse) return authResponse;

    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const id = formData.get("id");

    if (!file || !id) {
      return NextResponse.json(responseStructure(false, "Missing file or item ID"), { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Fetch item from database
    const mysqlConnection = await dbConnection;
    const [rows] = await mysqlConnection.execute(`SELECT * FROM \`users\` WHERE id=?`, [parseInt(id as string)]);

    if ((rows as  IUser[]).length === 0) {
      return NextResponse.json(responseStructure(false, "No Item Found"), { status: 404 });
    }

    const user = (rows as  IUser[])[0];

    // Delete old image from Cloudinary if exists
    if (user.image) {
      try {
        const publicId = user.image.replace(/^v\d+\//, "").replace(/\.[^.]+$/, "");
        await cloudinary.v2.uploader.destroy(publicId);
      } catch (error) {
        console.error("Failed to delete old Cloudinary image:", error);
      }
    }

    // Upload new image to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        { folder: process.env.CLOUDINARY_USER_FOLDER, public_id: `user_${user.id}_${Date.now()}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Extract Cloudinary URL and public ID
    const { secure_url } = uploadResponse as { secure_url: string; public_id: string };
    const extractedPath = secure_url.replace(/^.*\/upload\//, ""); // Store only relevant path

    // Update item record in the database
    await mysqlConnection.execute(`UPDATE some_table SET image=? WHERE id=?`, [extractedPath, id]);

    return NextResponse.json(responseStructure(true, "Successfully updated item image"), { status: 200 });
  } catch (error) {
    return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
  }
}