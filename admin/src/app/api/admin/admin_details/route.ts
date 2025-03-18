import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { z } from "zod";

const schema = z.object({
    id: z.string().min(1, "ID is required").regex(/^[0-9]+$/, "ID must be a numeric string"),
});

export async function POST(req: NextRequest) {
    try {
        // Authenticate user using authMiddleware
        const authResult = await authMiddleware(req) as {success:boolean,admin:IAdmin};
        if (!authResult.success) {
            return authResult; // `authMiddleware` already returns a `NextResponse`
        }

        // Parse request body
        const body = await req.json();
        const parseResult = schema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(responseStructure(false, "Invalid input", parseResult.error.format()), { status: 400 });
        }

        const { id } = parseResult.data;
        const mysqlDb = await dbConnection;

        const [rows] = await mysqlDb.execute(`SELECT * FROM \`admins\` WHERE id=?`, [id]);

        if (!(rows as IAdmin[]).length) {
            return NextResponse.json(responseStructure(false, "No admin found"), { status: 404 });
        }

        const admin: IAdmin = (rows as IAdmin[])[0];

        // Exclude password before sending response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...adminDetails } = admin;

        return NextResponse.json(responseStructure(true, "Successfully fetched admin details", adminDetails), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}