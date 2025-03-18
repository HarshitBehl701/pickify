import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, hashString, responseStructure } from "@/utils/commonUtils";
import { IAdmin } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req) as { success: boolean, admin: IAdmin };
        if (!authResult.success) {
            return NextResponse.json(responseStructure(false, "Unauthorized"), { status: 401 });
        }

        const body = await req.json();
        const parseResult = schema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(responseStructure(false, "Invalid input", parseResult.error.format()), { status: 400 });
        }

        const { name, email, password } = parseResult.data;

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`admins\` WHERE email=?`, [email]);

        if ((rows as IAdmin[]).length) {
            return NextResponse.json(responseStructure(false, "Admin Already Exists With Same Email"), { status: 409 });
        }

        const hashPassword: string = await hashString(password);

        const [result] = await mysqlDb.execute(
            `INSERT INTO \`admins\` (name, email, password, is_active) VALUES (?, ?, ?, ?)`,
            [name, email, hashPassword, 1]
        ) as RowDataPacket[];

        if (result.affectedRows === 0) {
            return NextResponse.json(responseStructure(false, "Something Went Wrong"), { status: 400 });
        }

        return NextResponse.json(responseStructure(true, "Successfully Added New Admin"), { status: 201 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}