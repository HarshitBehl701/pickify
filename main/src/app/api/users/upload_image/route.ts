import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { authMiddleware } from "@/middlewares/authMiddleware";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";

// Define the directory where files will be stored
const uploadDir = path.join(process.cwd(), "public/assets/users");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

    // Generate a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExt = path.extname(file.name);
    const fileName = `${uniqueSuffix}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to Buffer and save
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, fileBuffer);

    // Delete old image if exists
    if (user.image) {
      const oldImagePath = path.join(uploadDir, user.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update database with new image
    const mysqlConnection = await dbConnection;
    await mysqlConnection.execute(`UPDATE users SET image=? WHERE id=?`, [fileName, user.id]);

    return NextResponse.json(responseStructure(true, "Successfully updated profile photo"), { status: 200 });
  } catch (error) {
    return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
  }
}