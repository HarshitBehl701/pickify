import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { IUser } from "@/interfaces/modelInterface";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import dbConnection from "@/config/db";

// Define Upload Directory
const uploadDir = path.join(process.cwd(), "public/assets/users");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

// File Upload Handler
export async function POST(req: NextRequest) {
  try {
    const authResponse = await authMiddleware(req);
    if (authResponse instanceof NextResponse) return authResponse;

    const formData = await req.formData();
    const file = formData.get("image") as File;
    const id = formData.get("id");

    if (!file || !id) {
      return NextResponse.json(responseStructure(false, "Missing file or user ID"), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.name)}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Update User Image in Database
    const mysqlConnection = await dbConnection;
    const [rows] = await mysqlConnection.execute(`SELECT * FROM \`users\` WHERE id=?`, [parseInt(id as string)]);

    if ((rows as IUser[]).length === 0) {
      return NextResponse.json(responseStructure(false, "No User Found"), { status: 404 });
    }

    const user = (rows as IUser[])[0];

    // Delete Old Profile Picture (if exists)
    if (user?.image) {
      const oldImagePath = path.join(uploadDir, user.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    await mysqlConnection.execute(`UPDATE \`users\` SET \`image\`=? WHERE id=?`, [fileName, user?.id]);

    return NextResponse.json(responseStructure(true, "Successfully Updated Profile Photo"), { status: 200 });
  } catch (error) {
    return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
  }
}