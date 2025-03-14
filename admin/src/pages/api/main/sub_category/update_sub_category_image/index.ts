import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { createRouter } from "next-connect";
import jwt from "jsonwebtoken";
import dbConnection from "@/config/db";
import { IAdmin, ISubCategory } from "@/migrations/Migration";

interface CustomNextApiRequest extends NextApiRequest {
    admin?: IAdmin;
    file?: Express.Multer.File;
}

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
    upload.single("image")(req as any, res as any, async (err) => {
        try {
            if (err) {
                return res.status(400).json(responseStructure(false, "File upload error"));
            }
            const { id} = req.body;
            const imageName = req.file ? req.file.filename : '';
            const mysqlConnection = await dbConnection;
    
            const [categoryRows] = await mysqlConnection.execute(`SELECT * FROM  \`sub_categories\` WHERE id=?`, [parseInt(id)]);
    
            if ((categoryRows as ISubCategory[]).length === 0) {
                return res.status(404).json(responseStructure(false, "No sub_category Found"));
            }
    
            const sub_category = (categoryRows as ISubCategory[])[0];
    
            if (sub_category.image) {
                const imagePath = path.join(process.cwd(), `public/assets/mainAssets/main/${sub_category.image}`);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }           
    
            await mysqlConnection.execute(`UPDATE \`sub_categories\` SET \`image\`=? WHERE id=?`, [imageName,parseInt(id)]);
    
            next();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return res.status(400).json(responseStructure(false, "File upload error"));
        }
    });
};

const handlerFunction = (req: NextApiRequest, res: NextApiResponse) => {
    const handler = createRouter<CustomNextApiRequest, NextApiResponse>()
        .use(authCustomMiddleware)
        .use(multerMiddleware)
        .post((req: CustomNextApiRequest, res: NextApiResponse) => {
            if (!req.file) {
                return res.status(400).json(responseStructure(false, "No file uploaded"));
            }

            return res.status(200).json(responseStructure(true, "Successfully Updated sub sub_category"));
        });

    return handler.run(req, res);
};

export default handlerFunction;