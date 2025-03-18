import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnection from "@/config/db";
import { IUser } from "@/interfaces/modelInterface";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";

export async function authMiddleware(req: NextRequest) {
    try {
        const token = req.cookies.get("userAuthToken")?.value;
        
        if (!token) {
            return NextResponse.json({ success: false, message: "Unauthorized. Token missing." }, { status: 401 });
        }

        const secret_key = process.env.SECRET_KEY || "pickify";
        
        // Verify JWT token
        const decoded = jwt.verify(token, secret_key);
        if (!decoded) {
            return NextResponse.json({ success: false, message: "Unauthorized. Invalid token." }, { status: 401 });
        }

        const { id } = decoded as { id: number };
        const mysqlConnection = await dbConnection;
        const [rows] = await mysqlConnection.execute("SELECT * FROM `users` WHERE id=?", [id]);

        if ((rows as IUser[]).length === 0) {
            return NextResponse.json(responseStructure(false, "No User Found"), { status: 404 });
        }

        const user = (rows as IUser[])[0];
        return user;
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 401 });
    }
}