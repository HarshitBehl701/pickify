import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IUser } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { z } from "zod";

const schema = z.object({
    id: z.number(),
});

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req);
        if (authResult.status !== 200) {
            return authResult;
        }

        const body = await req.json();
        const parseResult = schema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(responseStructure(false, "Invalid input", parseResult.error.format()), { status: 400 });
        }

        const { id } = parseResult.data;

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`users\` WHERE id=?`, [id]);

        if (!(rows as IUser[]).length) {
            return NextResponse.json(responseStructure(false, "No user found"), { status: 404 });
        }

        const userAccount: IUser = (rows as IUser[])[0];

        return NextResponse.json(responseStructure(true, "Successfully fetched User Account", { userAccount }), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}