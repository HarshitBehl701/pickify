import { NextRequest, NextResponse } from "next/server";
import multer from "multer";
import path from "path";
import fs from "fs";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import dbConnection from "@/config/db";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { ICategory } from "@/migrations/Migration";

const uploadDir = path.join(process.cwd(), "public/assets/mainAssets/main");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const upload = multer({ storage });

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req);
        if (authResult.status !== 200) {
            return authResult;
        }
        
        const formData = await req.formData();
        const id = formData.get("id");
        const file = formData.get("image") as File;
        
        if (!id || !file) {
            return NextResponse.json(responseStructure(false, "Missing required fields"), { status: 400 });
        }

        const mysqlConnection = await dbConnection;
        const [categoryRows] = await mysqlConnection.execute("SELECT * FROM `categories` WHERE id=?", [parseInt(id as string)]);

        if ((categoryRows as ICategory[]).length === 0) {
            return NextResponse.json(responseStructure(false, "No category found"), { status: 404 });
        }

        const category = (categoryRows as ICategory[])[0];

        if (category.image) {
            const imagePath = path.join(uploadDir, category.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        const filePath = path.join(uploadDir, file.name);
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        await mysqlConnection.execute("UPDATE `categories` SET `image`=? WHERE id=?", [file.name, parseInt(id as  string)]);

        return NextResponse.json(responseStructure(true, "Successfully updated category"), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};