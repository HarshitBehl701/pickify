import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin, ICategory } from "@/migrations/Migration";
import { RowDataPacket, OkPacket } from "mysql2";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { createRouter } from "next-connect";

interface CustomNextApiRequest extends NextApiRequest {
    admin?: IAdmin;
    file?: Express.Multer.File;
    uploadeFile?: string;
}

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
    upload.single("image")(req as any, res as any, (err) => {
        if (err) {
            return res.status(400).json(responseStructure(false, "File upload error"));
        }
        const imageName = req.file ? req.file.filename : '';
        if (!imageName) {
            return res.status(400).json(responseStructure(false, "File upload error"));
        }
        req.uploadeFile = imageName;
        next();
    });
};

// Input Validation Schema
const categorySchema = z.object({
    name: z.string().min(3, "Category name must be at least 3 characters"),
});

// Handler function
const handler = createRouter<CustomNextApiRequest, NextApiResponse>()
    .use(authCustomMiddleware)
    .use(multerMiddleware)
    .post(async (req: CustomNextApiRequest, res: NextApiResponse) => {
        try {
            const parsedData = categorySchema.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(responseStructure(false, "Invalid Form Data", parsedData.error.errors));
            }

            const { name } = parsedData.data;
            const mysqlDb = await dbConnection;
            const [rows] = await mysqlDb.execute(`SELECT * FROM \`categories\` WHERE name=?`, [name]) as RowDataPacket[];

            if ((rows as ICategory[]).length > 0) {
                return res.status(400).json(responseStructure(false, "Category already exists with the same name"));
            }

            const uploadedFileName = req.uploadeFile;
            const result = await mysqlDb.execute(
                `INSERT INTO \`categories\` (name, image, is_active) VALUES (?, ?, 1)`,
                [name, uploadedFileName]
            ) as OkPacket[];

            if (result[0].affectedRows === 0) {
                return res.status(400).json(responseStructure(false, "Something Went Wrong"));
            }

            return res.status(201).json(responseStructure(true, "Successfully Created Category"));
        } catch (error) {
            return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
        }
    });

export default handler.handler();