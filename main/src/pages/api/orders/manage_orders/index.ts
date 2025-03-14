import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket, OkPacket } from "mysql2";
import { z } from "zod";
import { IOrder, IUser } from "@/interfaces/modelInterface";

// Define validation schema
const orderUpdateSchema = z.object({
    id: z.number({ invalid_type_error: "Order ID must be a number" }).positive(),
    status: z.enum([
        "Cancelled","Returned"
    ]),
});

async function handler(req: ICustomApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const parsedData = orderUpdateSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json(responseStructure(false, "Invalid Form Data", parsedData.error.format()));
        }

        const user = req.user;

        const { id, status } = parsedData.data;

        const mysqlDb = await dbConnection;

        const [rows] = await mysqlDb.execute(`SELECT * FROM \`orders\` WHERE id=? AND user_id=?`, [id,user?.id]) as RowDataPacket[];
        if (!(rows as IOrder[]).length) {
            return res.status(404).json(responseStructure(false, "No Order found"));
        }

        const result = await mysqlDb.execute(
            `UPDATE \`orders\` SET \`status\`=? WHERE id=? AND user_id=?`,
            [status, id,user?.id]
        ) as OkPacket[];

        if (result[0].affectedRows === 0) {
            return res.status(400).json(responseStructure(false, "No changes were made to the order"));
        }

        return res.status(200).json(responseStructure(true, "Successfully Updated Order"));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);

interface ICustomApiRequest  extends NextApiRequest{
    user?:IUser
}