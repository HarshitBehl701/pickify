import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure, hashString } from "@/utils/commonUtils";
import { IUser } from "@/interfaces/modelInterface";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

// Define Zod schema for validation
const schema = z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long").optional(),
    address: z.string().optional(),
    is_active: z.number().optional(),
});

export async function POST(req: NextRequest) {
    try {
        // Authenticate User
        const user = await authMiddleware(req);
        if (user instanceof NextResponse) {
            return user; // Return 401 Unauthorized if user is not authenticated
        }

        // Parse request body
        const body = await req.json();
        const parseResult = schema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(responseStructure(false, "Invalid input", parseResult.error.format()), { status: 400 });
        }

        const { name, email, password, address, is_active } = parseResult.data;

        // Prepare update fields
        const updateFields: { [key: string]: string | number | undefined } = { name, address };
        if (password) {
            updateFields.password = await hashString(password);
        }

        // Remove undefined fields
        const updateRequestFields = Object.fromEntries(
            Object.entries(updateFields).filter(([, value]) => value !== undefined)
        );

        const mysqlDb = await dbConnection;

        // Check if email is already in use (if provided)
        if (email && user.email !== email) {
            const [emailRows] = await mysqlDb.execute(
                `SELECT * FROM users WHERE email=? AND id!=? AND is_active=1`,
                [email, user.id]
            );

            if ((emailRows as IUser[]).length > 0) {
                return NextResponse.json(responseStructure(false, "User Already Exists With Same Email"), { status: 409 });
            } else {
                updateRequestFields.email = email;
            }
        }

        if (is_active !== undefined) {
            updateRequestFields.is_active = is_active;
        }

        // Generate SQL query dynamically
        const fields: string = Object.keys(updateRequestFields)
            .map((key) => `\`${key}\`=?`)
            .join(",");

        if (Object.keys(updateRequestFields).length === 0) {
            return NextResponse.json(responseStructure(false, "No fields to update"), { status: 400 });
        }

        // Execute update query
        const result = (await mysqlDb.execute(
            `UPDATE users SET ${fields} WHERE id=?`,
            [...Object.values(updateRequestFields), user.id]
        )) as RowDataPacket;

        if (result.affectedRows === 0) {
            return NextResponse.json(responseStructure(false, "Something Went Wrong"), { status: 400 });
        }

        return NextResponse.json(responseStructure(true, "Successfully Updated User Account"), { status: 200 });

    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}