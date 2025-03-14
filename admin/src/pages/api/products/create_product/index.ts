import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { createRouter } from "next-connect";
import jwt from "jsonwebtoken";
import dbConnection from "@/config/db";
import { IAdmin, IProduct } from "@/migrations/Migration";
import { z } from "zod";
import { OkPacket } from "mysql2";

interface CustomNextApiRequest extends NextApiRequest {
    admin?: IAdmin;
    files?: Express.Multer.File[];
    storeFileName?: string[];
}

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

const upload = multer({ storage });

export const config = {
    api: {
        bodyParser: false,
    },
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const authCustomMiddleware = async (req: CustomNextApiRequest, res: NextApiResponse, next: Function) => {
    try {
        const token = req.cookies?.adminAuthToken;
        if (!token) {
            return res.status(401).json(responseStructure(false, "Unauthorized. Token missing."));
        }

        const secret_key = process.env.SECRET_KEY || "pickify";
        const decoded = jwt.verify(token, secret_key);
        if (!decoded) {
            return res.status(401).json(responseStructure(false, "Unauthorized. Invalid token."));
        }

        const { id } = decoded as { id: number };

        const mysqlConnection = await dbConnection;
        const [rows] = await mysqlConnection.execute(`SELECT * FROM \`admins\` WHERE id=?`, [id]);

        if ((rows as IAdmin[]).length === 0) {
            return res.status(404).json(responseStructure(false, "No User Found"));
        }

        req.admin = (rows as IAdmin[])[0];
        next();
    } catch (error) {
        return res.status(401).json(responseStructure(false, handleCatchErrors(error)));
    }
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const multerMiddleware = (req: CustomNextApiRequest, res: NextApiResponse, next: Function) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upload.array("images[]")(req as any, res as any, async (err) => {
        try {
            if (err) {
                return res.status(400).json(responseStructure(false, "File upload error"));
            }

            req.storeFileName = (req.files as Express.Multer.File[]).map(file => file.filename);

            return next();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return res.status(400).json(responseStructure(false, "File upload error"));
        }
    });
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

const handlerFunction = (req: NextApiRequest, res: NextApiResponse) => {
    const handler = createRouter<CustomNextApiRequest, NextApiResponse>()
        .use(authCustomMiddleware)
        .use(multerMiddleware)
        .post(async (req: CustomNextApiRequest, res: NextApiResponse) => {
            if (!req.storeFileName || req.storeFileName.length == 0) {
                return res.status(400).json(responseStructure(false, "No file uploaded"));
            }

            try{  const parseResult = schema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json(responseStructure(false, "Invalid input", parseResult.error.format()));
            }

            const { name, description, specifications, category, subcategory, price, discount } = parseResult.data;

            const mysqlDb = await dbConnection;

            const [categoryRows] = await mysqlDb.execute(`SELECT * FROM \`categories\` WHERE id=?`, [category]);
            if (!(categoryRows as IProduct[]).length) {
                return res.status(404).json(responseStructure(false, "No Category found"));
            }

            const subCategoryIds = subcategory.split(',').map(Number);
            const [subCategoryRows] = await mysqlDb.execute(
                `SELECT id FROM \`sub_categories\` WHERE id IN (${subCategoryIds.map(() => '?').join(',')})`,
                subCategoryIds
            );

            if ((subCategoryRows as IProduct[]).length !== subCategoryIds.length) {
                return res.status(404).json(responseStructure(false, "One or more Sub Categories not found"));
            }

            const uploadedFiles = req.storeFileName;

            const [result] = await mysqlDb.execute(
                `INSERT INTO \`products\` (name,images, description, specification, category, sub_category, price, discount, is_active)  
            VALUES (?, ?, ?,? ,?, ?, ?, ?, 1)`,
                [name, uploadedFiles.join(","), description, specifications, category, subcategory, price, discount]
            ) as OkPacket[];

            if (result.affectedRows === 0) {
                return res.status(400).json(responseStructure(false, "Something Went Wrong"));
            }

            return res.status(201).json(responseStructure(true, "Successfully Created New Product"));
        } catch (error) {
            console.log(error);
            return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
        }
});

return handler.run(req, res);
};

export default handlerFunction;