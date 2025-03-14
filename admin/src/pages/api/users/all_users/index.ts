import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IUser } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const mysqlDb = await dbConnection;
        const [rows] = await  mysqlDb.execute(`SELECT * FROM \`users\``);
        

        if (!(rows as IUser[]).length) {
            return res.status(404).json(responseStructure(false, "No user found"));
        }

        const users: IUser[] = rows as  IUser[];

        const requestedData  =  users.map((user) => ({
            id:user.id,
            email:user.email,
            name:user.name,
            image:user.image,
            is_active:user.is_active,
            created_at:user.created_at,
            updated_at:user.updated_at
        }))

        return res.status(200).json(responseStructure(true, "Successfully Fetch   All Users", requestedData));
        
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);