import { NextRequest, NextResponse } from "next/server";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { deleteCookie } from "cookies-next";

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req) as { success: boolean };

        if (!authResult.success) {
            return NextResponse.json(responseStructure(false, "Unauthorized"), { status: 401 });
        }

        const response = NextResponse.json(responseStructure(true, "Successfully logged out"));
        deleteCookie("adminAuthToken", { res: response });

        return response;
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}