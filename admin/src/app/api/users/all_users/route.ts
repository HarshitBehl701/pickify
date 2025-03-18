import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IUser } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req);
        if (authResult.status !== 200) {
            return authResult;
        }

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`users\``);

        if (!(rows as IUser[]).length) {
            return NextResponse.json(responseStructure(false, "No user found"), { status: 404 });
        }

        const users: IUser[] = rows as IUser[];

        const requestedData = users.map((user) => ({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at
        }));

        return NextResponse.json(responseStructure(true, "Successfully fetched all users", requestedData), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}