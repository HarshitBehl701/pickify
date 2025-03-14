import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
import { IUser } from "@/interfaces/modelInterface";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { createRouter } from "next-connect";
import jwt from "jsonwebtoken";
import dbConnection from "@/config/db";

interface CustomNextApiRequest extends NextApiRequest {
  user?: IUser;
  file?: Express.Multer.File;
}

const uploadDir = path.join(process.cwd(), "public/assets/users");
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
    res.setHeader("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_ADMIN_API ?? '');
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

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
    

    if ((rows as []).length === 0) {
      return res.status(404).json(responseStructure(false, "No Admin Found"));
    }
    return  next();
  } catch (error) {
    return res.status(401).json(responseStructure(false, handleCatchErrors(error)));
  }
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const multerMiddleware = (req: CustomNextApiRequest, res: NextApiResponse, next: Function) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upload.single("image")(req as any, res as any,async (err) => {
    try {
      if (err) {
        return res.status(400).json(responseStructure(false, "File upload error"));
      }  
      const mysqlConnection = await dbConnection;
      const  {id} =  req.body;
      const [rows] = await mysqlConnection.execute(`SELECT * FROM \`users\` WHERE id=?`, [parseInt(id)]);
    
      if ((rows as IUser[]).length === 0) {
        return res.status(404).json(responseStructure(false, "No User Found"));
      }
  
      const  user = (rows as  IUser[])[0];

      const imageName = req.file  ? req.file.filename : '';
      await mysqlConnection.execute(`UPDATE \`users\` SET \`image\`=? WHERE id=?`, [imageName,user?.id]);
  
      return next() 
    } catch (error) {
      return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
  });
};

const handlerFunction = (req: NextApiRequest, res: NextApiResponse) => {
  const handler = createRouter<CustomNextApiRequest, NextApiResponse>()
    .use(authCustomMiddleware)
    .use(multerMiddleware)
    .post(async   (req: CustomNextApiRequest, res: NextApiResponse) => {
      if (!req.file) {
        return res.status(400).json(responseStructure(false, "No file uploaded"));
      }

      const user = req.user;
      
      if (user?.image) {
        const imagePath = path.join(process.cwd(), `public/assets/users/${user.image}`);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      return res.status(200).json(responseStructure(true, "Successfully Updated Profile Photo"));
    });

  return handler.run(req, res);
};

export default handlerFunction;