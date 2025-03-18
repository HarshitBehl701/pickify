import { NextRequest, NextResponse } from "next/server";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";

export async function POST(req: NextRequest) {
    try {
        // Authenticate User
        const user = await authMiddleware(req);
        if (user instanceof NextResponse) {
            return user; // Return 401 Unauthorized if user is not authenticated
        }

        return NextResponse.json(responseStructure(true, "Successfully Fetched User Details", user), { status: 200 });
        
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}