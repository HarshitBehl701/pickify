import { NextRequest, NextResponse } from "next/server";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req) as   NextResponse;
        if (authResult.status !== 200) {
            return authResult;
        }

        const authData = await authResult.json();
        const admin = authData.data.admin;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...adminDetails } = admin;
        return NextResponse.json(responseStructure(true, "Successfully fetched admin details", adminDetails));
    } catch (error) {
        console.log(error);
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}