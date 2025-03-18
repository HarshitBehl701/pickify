import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

// Define validation schema
const schema = z.object({
    id: z.number(),
    name: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long").optional(),
    is_active: z.number().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req);
        if (authResult.status !== 200) {
            return authResult;
        }


        const body = await req.json();

        // Validate input
        const parseResult = schema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(responseStructure(false, "Invalid input", parseResult.error.format()), { status: 400 });
        }

        const { id, name, email, password, is_active } = parseResult.data;

        const allowedFields: { [key: string]: string | number | undefined } = { name, password };
        const updateRequestFields = Object.fromEntries(
            Object.entries(allowedFields).filter(([, value]) => value !== undefined)
        );

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`admins\` WHERE id=?`, [id]);

        if (!(rows as IAdmin[]).length) {
            return NextResponse.json(responseStructure(false, "No admin found"), { status: 404 });
        }

        const adminAccount: IAdmin = (rows as IAdmin[])[0];

        if (email && adminAccount.email !== email) {
            const [emailRows] = await mysqlDb.execute(
                `SELECT * FROM \`admins\` WHERE email=? AND id!=? AND is_active=?`,
                [email, id, 1]
            );

            if ((emailRows as IAdmin[]).length > 0) {
                return NextResponse.json(responseStructure(false, "Admin Already Exists With Same Email"), { status: 404 });
            } else updateRequestFields.email = email;
        }

        if (is_active !== undefined) {
            updateRequestFields.is_active = is_active;
        }

        const fields: string = Object.keys(updateRequestFields)
            .map((key) => ` \`${key}\`=? `)
            .join(",");

        const result = (await mysqlDb.execute(
            `UPDATE \`admins\` SET ${fields} WHERE id=?`,
            [...Object.values(updateRequestFields), id]
        )) as RowDataPacket;

        if (result.affectedRows == 0) {
            return NextResponse.json(responseStructure(false, "Something Went Wrong"), { status: 400 });
        }

        return NextResponse.json(responseStructure(true, "Successfully Updated Admin Account"));
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}