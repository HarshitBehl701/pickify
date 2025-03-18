import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin, ICategory } from "@/migrations/Migration";
import { RowDataPacket, OkPacket } from "mysql2";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "@/middlewares/authMiddleware";

const uploadDir = path.join(process.cwd(), "public/assets/mainAssets/main");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const upload = multer({ storage });

export const config = {
    api: {
        bodyParser: false,
    },
};

// Input Validation Schema
const categorySchema = z.object({
    name: z.string().min(3, "Category name must be at least 3 characters"),
});

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req) as { success: boolean, admin: IAdmin };

        if (!authResult.success) {
            return NextResponse.json(responseStructure(false, "Unauthorized"), { status: 401 });
        }

        const formData = await req.formData();
        const name = formData.get("name") as string;
        const imageFile = formData.get("image") as File | null;

        if (!name) {
            return NextResponse.json(responseStructure(false, "Invalid Form Data"), { status: 400 });
        }

        const parsedData = categorySchema.safeParse({ name });
        if (!parsedData.success) {
            return NextResponse.json(responseStructure(false, "Invalid Form Data", parsedData.error.errors), { status: 400 });
        }

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`categories\` WHERE name=?`, [name]) as RowDataPacket[];

        if ((rows as ICategory[]).length > 0) {
            return NextResponse.json(responseStructure(false, "Category already exists with the same name"), { status: 400 });
        }

        let uploadedFileName = "";
        if (imageFile) {
            const fileExtension = path.extname(imageFile.name);
            const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
            const filePath = path.join(uploadDir, uniqueFileName);
            const buffer = Buffer.from(await imageFile.arrayBuffer());

            fs.writeFileSync(filePath, buffer);
            uploadedFileName = uniqueFileName;
        }

        const result = await mysqlDb.execute(
            `INSERT INTO \`categories\` (name, image, is_active) VALUES (?, ?, 1)`,
            [name, uploadedFileName]
        ) as OkPacket[];

        if (result[0].affectedRows === 0) {
            return NextResponse.json(responseStructure(false, "Something Went Wrong"), { status: 400 });
        }

        return NextResponse.json(responseStructure(true, "Successfully Created Category"), { status: 201 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}