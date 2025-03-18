import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";

export async function POST(req: NextRequest) {
    try {
        // Authenticate the user using authMiddleware
        const authResult = await authMiddleware(req) as  {success:boolean,admin:IAdmin};
        if (!authResult.success) {
            return authResult; // `authMiddleware` returns a `NextResponse` if authentication fails
        }

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`admins\``);

        if (!(rows as IAdmin[]).length) {
            return NextResponse.json(responseStructure(false, "No admin found"), { status: 404 });
        }

        const admins: IAdmin[] = rows as IAdmin[];

        const requestedData = admins.map((admin) => ({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            image: admin.image,
            is_active: admin.is_active,
            created_at: admin.created_at,
            updated_at: admin.updated_at,
        }));

        return NextResponse.json(responseStructure(true, "Successfully fetched all admins", requestedData), { status: 200 });

    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}