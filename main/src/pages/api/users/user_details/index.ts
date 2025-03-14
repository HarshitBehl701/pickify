import type { NextApiRequest, NextApiResponse } from "next";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IUser } from "@/interfaces/modelInterface";
import { authMiddleware } from "@/middlewares/authMiddleware";

async function handler(req: ICustomApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const user = req.user;

        return res.status(200).json(responseStructure(true, "Successfully Fetch User Details", user));
        
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);

interface ICustomApiRequest  extends NextApiRequest{
    user?:IUser
}