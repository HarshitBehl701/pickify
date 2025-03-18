import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnection from "@/config/db";
import { IAdmin } from "@/migrations/Migration";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";

// Middleware function for admin authentication
export async function authMiddleware(req: NextRequest) {
  try {
    const token = req.cookies.get("adminAuthToken")?.value;

    if (!token) {
      return NextResponse.json(responseStructure(false, "Unauthorized. Token missing."), { status: 401 });
    }

    const secret_key = process.env.SECRET_KEY || "pickify";

    // Verify JWT token
    const decoded = jwt.verify(token, secret_key) as { id: number };
    if (!decoded) {
      return NextResponse.json(responseStructure(false, "Unauthorized. Invalid token."), { status: 401 });
    }

    const mysqlConnection = await dbConnection;
    const [rows] = await mysqlConnection.execute(`SELECT * FROM \`admins\` WHERE id=?`, [decoded.id]);

    if ((rows as IAdmin[]).length === 0) {
      return NextResponse.json(responseStructure(false, "No User Found"), { status: 404 });
    }

    const admin = (rows as IAdmin[])[0];

    // Return authenticated admin object
    return { success: true, admin };
  } catch (error) {
    return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 401 });
  }
}