import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import dbConnection from "@/config/db";
import { IAdmin, ISubCategory } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import multer from "multer";
import { RowDataPacket } from "mysql2";

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), "public/assets/mainAssets/main");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const upload = multer({ storage });

// Function to process formData
async function processFile(req: NextRequest): Promise<{ id: number; filePath: string } | null> {
    const formData = await req.formData();
    const id = Number(formData.get("id"));
    const file = formData.get("image") as File;

    if (!id || !file) return null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.name)}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);
    return { id, filePath: fileName };
}

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req) as { success: boolean, admin: IAdmin };
        if (!authResult.success) {
            return NextResponse.json(responseStructure(false, "Unauthorized"), { status: 401 });
        }

        const fileData = await processFile(req);
        if (!fileData) {
            return NextResponse.json(responseStructure(false, "Invalid form data"), { status: 400 });
        }

        const { id, filePath } = fileData;
        const mysqlDb = await dbConnection;

        // Check if sub-category exists
        const [categoryRows] = await mysqlDb.execute(`SELECT * FROM \`sub_categories\` WHERE id=?`, [id]) as RowDataPacket[];
        if ((categoryRows as ISubCategory[]).length === 0) {
            return NextResponse.json(responseStructure(false, "No sub-category found"), { status: 404 });
        }

        const sub_category = (categoryRows as ISubCategory[])[0];

        // Delete old image if exists
        if (sub_category.image) {
            const oldImagePath = path.join(uploadDir, sub_category.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Update the database with the new image
        await mysqlDb.execute(`UPDATE \`sub_categories\` SET \`image\`=? WHERE id=?`, [filePath, id]);

        return NextResponse.json(responseStructure(true, "Successfully updated sub-category image"), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}