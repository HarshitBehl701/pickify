import multer from "multer";
import path from "path";
import fs from "fs";

const storageDirectory: Record<string, string> = {
    mainAssets: "public/assets/mainAssets/main",
    userAssets: "public/assets/userAssets",
    products: "public/assets/productAssets",
};

const createStorage = (category: string) => {
    if (!storageDirectory[category]) {
        throw new Error("Invalid storage category");
    }

    const uploadDir = path.join(process.cwd(), storageDirectory[category]);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        },
    });
};

export const getMulterUploader = (category: string) => {
    if (!storageDirectory[category]) {
        throw new Error("Invalid category");
    }

    return multer({
        storage: createStorage(category),
        limits: { fileSize: 3 * 1024 * 1024 },
    });
};