import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin, ICategory } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket, OkPacket } from "mysql2";
import { z } from "zod";

const categorySchema = z.object({
    id: z.number().positive("Invalid category ID"),
    name: z.string().min(3, "Category name must be at least 3 characters").optional(),
    is_active: z.number().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req) as { success: boolean, admin: IAdmin };
        if (!authResult.success) {
            return NextResponse.json(responseStructure(false, "Unauthorized"), { status: 401 });
        }

        const body = await req.json();
        const parsedData = categorySchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json(responseStructure(false, "Invalid Data", parsedData.error.errors), { status: 400 });
        }

        const { id, name, is_active } = parsedData.data;
        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`categories\` WHERE id=?`, [id]) as RowDataPacket[];

        if ((rows as ICategory[]).length === 0) {
            return NextResponse.json(responseStructure(false, "No Category found"), { status: 404 });
        }

        const category: ICategory = (rows as ICategory[])[0];

        if (name && name !== category.name) {
            const [existing] = await mysqlDb.execute(`SELECT * FROM \`categories\` WHERE name=? AND id!=?`, [name, id]) as RowDataPacket[];
            if ((existing as ICategory[]).length > 0) {
                return NextResponse.json(responseStructure(false, "Category already exists with the same name"), { status: 400 });
            }
        }

        const allowedFields = { name, is_active };
        const updateRequestFields = Object.fromEntries(Object.entries(allowedFields).filter(([, value]) => value !== undefined));

        if (Object.keys(updateRequestFields).length === 0) {
            return NextResponse.json(responseStructure(false, "No updates provided"), { status: 400 });
        }

        const fields = Object.keys(updateRequestFields).map((key) => `\`${key}\`=?`).join(",");
        const result = await mysqlDb.execute(
            `UPDATE \`categories\` SET ${fields} WHERE id=?`,
            [...Object.values(updateRequestFields), id]
        ) as OkPacket[];

        if (result[0].affectedRows === 0) {
            return NextResponse.json(responseStructure(false, "Something went wrong"), { status: 400 });
        }

        return NextResponse.json(responseStructure(true, "Successfully updated category"), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}