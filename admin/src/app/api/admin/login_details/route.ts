import { NextRequest, NextResponse } from "next/server";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req) as { success: boolean, admin: IAdmin };

        if (!authResult.success) {
            return NextResponse.json(responseStructure(false, "Unauthorized"), { status: 401 });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...adminDetails } = authResult.admin;
        return NextResponse.json(responseStructure(true, "Successfully fetched admin details", adminDetails));
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}