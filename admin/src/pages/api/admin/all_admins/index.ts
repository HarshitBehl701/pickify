import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IAdmin } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const mysqlDb = await dbConnection;
        const [rows] = await  mysqlDb.execute(`SELECT * FROM \`admins\``);
        

        if (!(rows as IAdmin[]).length) {
            return res.status(404).json(responseStructure(false, "No admin found"));
        }

        const admins: IAdmin[] = rows as  IAdmin[];

        const requestedData  =  admins.map((admin) => ({
            id:admin.id,
            email:admin.email,
            name:admin.name,
            image:admin.image,
            is_active:admin.is_active,
            created_at:admin.created_at,
            updated_at:admin.updated_at
        }))

        return res.status(200).json(responseStructure(true, "Successfully Fetch   All Admins", requestedData));
        
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);