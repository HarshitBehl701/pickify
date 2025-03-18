import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure, verifyHashString } from "@/utils/commonUtils";
import { IAdmin } from "@/migrations/Migration";
import { z } from "zod";
import { serialize } from "cookie";
import Jwt from "jsonwebtoken";

// Define validation schema
const schema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parseResult = schema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(responseStructure(false, "Invalid input", parseResult.error.format()), { status: 400 });
        }

        const { email, password } = parseResult.data;

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`admins\` WHERE email=?`, [email]);
        
        if (!(rows as IAdmin[]).length) {
            return NextResponse.json(responseStructure(false, "Email or Password is incorrect"), { status: 404 });
        }

        const user: IAdmin = (rows as IAdmin[])[0];

        if (!verifyHashString(user.password, password)) {
            return NextResponse.json(responseStructure(false, "Email or Password is incorrect"), { status: 404 });
        }

        const secret_key = process.env.SECRET_KEY || "pickify";
        const token = Jwt.sign({ id: user.id }, secret_key);

        const cookie = serialize("adminAuthToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userData } = user;

        const response = NextResponse.json(responseStructure(true, "Successfully Logged In", { userData }));
        response.headers.set("Set-Cookie", cookie);

        return response;
        }
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}