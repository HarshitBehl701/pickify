import type { NextApiRequest, NextApiResponse } from "next";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";

async function handler(req: ICustomNextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const admin = req.admin;
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...adminDetails } = admin  as IAdmin;
        return res.status(200).json(responseStructure(true, "Successfully fetched admin details", adminDetails));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);


interface ICustomNextApiRequest extends NextApiRequest{
    admin?:IAdmin
}