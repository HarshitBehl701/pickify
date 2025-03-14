import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const storageDirectory:Record<string,string> =  {
            'mainAssets' :"public/assets/mainAssets/main",
            'userAssets' :"public/assets/userAssets",
            'products' :"public/assets/productAssets",
        }
        
        const { type, filename } = req.query;
        if (!type || !filename   ||  (type &&  !(type as  string in storageDirectory))) {
            return res.status(400).json(responseStructure(false,"Invalid Reqeust"));
        }

        const filePath = path.join(process.cwd(), storageDirectory[type as string], filename as string);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json(responseStructure(false,"File Not found"));
        }

        const mimeType = mime.lookup(filePath) || "application/octet-stream";

        res.setHeader("Content-Type", mimeType);
        res.setHeader("Cache-Control", "no-store");

        fs.createReadStream(filePath).pipe(res);
    } catch (error) {
        return res.status(500).json(responseStructure(false,handleCatchErrors(error)));
    }
}