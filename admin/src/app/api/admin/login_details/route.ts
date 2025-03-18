import { NextRequest, NextResponse } from "next/server";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req);
        if (authResult.status !== 200) {
            return authResult;
        }
        const { admin } = await authResult.json();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...adminDetails } = admin;
        return NextResponse.json(responseStructure(true, "Successfully fetched admin details", adminDetails));
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}