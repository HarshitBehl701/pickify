import { NextResponse } from "next/server";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { cookies } from "next/headers";

export async function POST() {
    try {
        // Delete authentication token
        (await cookies()).delete("userAuthToken");

        return NextResponse.json(responseStructure(true, "Successfully logged out"), { status: 200 });

    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}
