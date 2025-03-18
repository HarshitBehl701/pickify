import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure, hashString } from "@/utils/commonUtils";
import { z } from "zod";
import { IUser } from "@/interfaces/modelInterface";

const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate input
        const parseResult = schema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(responseStructure(false, "Invalid input", parseResult.error.format()), { status: 400 });
        }

        const { name, email, password } = parseResult.data;
        const mysqlDb = await dbConnection;

        // Check if email already exists
        const [existingRows] = await mysqlDb.execute(`SELECT * FROM users WHERE email=?`, [email]);
        if ((existingRows as IUser[]).length) {
            return NextResponse.json(responseStructure(false, "Email is already in use"), { status: 409 });
        }

        // Hash the password
        const hashedPassword = await hashString(password);
        
        // Insert new user
        await mysqlDb.execute(`INSERT INTO users (name, email, password, is_active) VALUES (?, ?, ?, 1)`, [name, email, hashedPassword]);
        
        return NextResponse.json(responseStructure(true, "Successfully Registered"), { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}