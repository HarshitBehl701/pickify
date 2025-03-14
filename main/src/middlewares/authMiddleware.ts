import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnection from "@/config/db";
import { IUser } from "@/interfaces/modelInterface";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";

export function authMiddleware(handler: (req:CustomApiRequest,res:NextApiResponse) => unknown) {
    return async (req: CustomApiRequest, res: NextApiResponse) => {
        try {

            const token = req.cookies.userAuthToken;

            if (!token) {
                return res.status(401).json({ success: false, message: "Unauthorized. Token missing." });
            }

            const secret_key = process.env.SECRET_KEY || "pickify";

            // Verify JWT token
            const decoded = jwt.verify(token, secret_key);

            if (!decoded) {
                return res.status(401).json({ success: false, message: "Unauthorized. Invalid token." });
            }

            const  {id} = decoded as {id:number};

            const  mysqlConnection  = await dbConnection;
            const [rows]  =  await mysqlConnection.execute(`SELECT *  FROM \`users\`  WHERE id=?`,[id]);

            if((rows as IUser[]).length == 0)
            {
                return res.status(404).json(responseStructure(false,'No  User  Found'));
            }

            const user  = (rows  as IUser[])[0];

            req.user = user;

            return handler(req, res); // redirect to api  requested route
        } catch (error) {
            return res.status(401).json(responseStructure(false,handleCatchErrors(error)));
        }
    };
}

interface CustomApiRequest extends NextApiRequest {
    user?: IUser;
}