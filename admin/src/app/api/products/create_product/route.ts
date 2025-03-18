import { NextRequest, NextResponse } from "next/server";
import multer from "multer";
import path from "path";
import fs from "fs";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import dbConnection from "@/config/db";
import { IProduct } from "@/migrations/Migration";
import { z } from "zod";
import { OkPacket } from "mysql2";
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

export const config = {
    api: {
        bodyParser: false,
    },
};

const schema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(1, "Description is required"),
    specifications: z.string().min(1, "Specifications are required"),
    price: z.string().min(1, "Price is required"),
    discount: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    subcategory: z.string().min(1, "Subcategory is required"),
});

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req);
        if (authResult.status !== 200) {
            return authResult;
        }

        const formData = await req.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const specifications = formData.get("specifications");
        const price = formData.get("price");
        const discount = formData.get("discount");
        const category = formData.get("category");
        const subcategory = formData.get("subcategory");
        const files = formData.getAll("images[]") as File[];

        const parseResult = schema.safeParse({ name, description, specifications, price, discount, category, subcategory });
        if (!parseResult.success) {
            return NextResponse.json(responseStructure(false, "Invalid input", parseResult.error.format()), { status: 400 });
        }

        if (files.length === 0) {
            return NextResponse.json(responseStructure(false, "No file uploaded"), { status: 400 });
        }

        const uploadedFiles: string[] = [];
        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);
            fs.writeFileSync(filePath, buffer);
            uploadedFiles.push(path.basename(filePath));
        }

        const mysqlDb = await dbConnection;

        const [categoryRows] = await mysqlDb.execute(`SELECT * FROM \`categories\` WHERE id=?`, [category]);
        if (!(categoryRows as IProduct[]).length) {
            return NextResponse.json(responseStructure(false, "No Category found"), { status: 404 });
        }

        const subCategoryIds = (subcategory as   string).split(",").map(Number);
        const [subCategoryRows] = await mysqlDb.execute(
            `SELECT id FROM \`sub_categories\` WHERE id IN (${subCategoryIds.map(() => "?").join(",")})`,
            subCategoryIds
        );

        if ((subCategoryRows as IProduct[]).length !== subCategoryIds.length) {
            return NextResponse.json(responseStructure(false, "One or more Sub Categories not found"), { status: 404 });
        }

        const [result] = await mysqlDb.execute(
            `INSERT INTO \`products\` (name, images, description, specification, category, sub_category, price, discount, is_active)  
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [name, uploadedFiles.join(","), description, specifications, category, subcategory, price, discount]
        ) as OkPacket[];

        if (result.affectedRows === 0) {
            return NextResponse.json(responseStructure(false, "Something Went Wrong"), { status: 400 });
        }

        return NextResponse.json(responseStructure(true, "Successfully Created New Product"), { status: 201 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}