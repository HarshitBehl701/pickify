import { NextRequest, NextResponse } from "next/server";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { deleteCookie } from "cookies-next";

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req);
        if (authResult.status !== 200) {
            return authResult;
        }

        const response = NextResponse.json(responseStructure(true, "Successfully logged out"));
        deleteCookie("adminAuthToken", { res: response });

        return response;
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}