import type { NextApiRequest, NextApiResponse } from "next";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { deleteCookie } from "cookies-next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        deleteCookie("userAuthToken", { req, res });

        return res.status(200).json(responseStructure(true, "Successfully logged out"));
        
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);