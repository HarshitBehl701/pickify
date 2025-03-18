import { NextRequest, NextResponse } from "next/server";
import multer from "multer";
import path from "path";
import fs from "fs";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import dbConnection from "@/config/db";
import { IAdmin, IProduct } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";

const uploadDir = path.join(process.cwd(), "public/assets/productAssets");
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
        const authResult = await authMiddleware(req) as { success: boolean; admin: IAdmin };
        if (!authResult.success) {
            return NextResponse.json(responseStructure(false, "Unauthorized"), { status: 401 });
        }

        const formData = await req.formData();
        const id = formData.get("id");
        const deleteImage = formData.get("deleteImage");
        const file = formData.get("image") as File | null;

        if (!id) {
            return NextResponse.json(responseStructure(false, "Product ID is required"), { status: 400 });
        }

        const mysqlConnection = await dbConnection;
        const [productRows] = await mysqlConnection.execute(`SELECT * FROM \`products\` WHERE id=?`, [id]);

        if ((productRows as IProduct[]).length === 0) {
            return NextResponse.json(responseStructure(false, "No Product Found"), { status: 404 });
        }

        const product = (productRows as IProduct[])[0];
        const oldImages = product.images ? product.images.split(',') : [];

        if (deleteImage) {
            const imagePath = path.join(process.cwd(), `public/assets/productAssets/${deleteImage}`);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        if (file) {
            const filePath = path.join(uploadDir, file.name);
            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(filePath, buffer);
            oldImages.push(file.name);
        }

        if (oldImages.includes(deleteImage as  string)) {
            oldImages.splice(oldImages.indexOf(deleteImage  as string), 1);
        }

        await mysqlConnection.execute(`UPDATE \`products\` SET \`images\`=? WHERE id=?`, [oldImages.join(","), id]);

        return NextResponse.json(responseStructure(true, "Successfully Updated Product"), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
