import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure, verifyHashString } from "@/utils/commonUtils";
import { IUser } from "@/interfaces/modelInterface";
import { z } from "zod";
import { cookies } from "next/headers";
import Jwt from "jsonwebtoken";

// Define validation schema
const schema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(req: NextRequest) {
    try {
        // Parse request body
        const body = await req.json();
        const parseResult = schema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(responseStructure(false, "Invalid input", parseResult.error.format()), { status: 400 });
        }

        const { email, password } = parseResult.data;
        const mysqlDb = await dbConnection;

        const [rows] = await mysqlDb.execute(`SELECT * FROM \`users\` WHERE email=?`, [email]);

        if (!(rows as IUser[]).length) {
            return NextResponse.json(responseStructure(false, "Email or Password is incorrect"), { status: 404 });
        }

        const user: IUser = (rows as IUser[])[0];

        if (!verifyHashString(user.password, password)) {
            return NextResponse.json(responseStructure(false, "Email or Password is incorrect"), { status: 404 });
        }

        // Generate JWT token
        const secret_key = process.env.SECRET_KEY || "pickify";
        const token = Jwt.sign({ id: user.id }, secret_key, { expiresIn: "1d" });

        // Set HTTP-only cookie
        (await cookies()).set({
            name: "userAuthToken",
            value: token,
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        {
            // Remove password from response
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userData } = user;

            return NextResponse.json(responseStructure(true, "Successfully Logged In", { userData }), { status: 200 });
        }
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}