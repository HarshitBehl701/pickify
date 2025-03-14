import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure, verifyHashString } from "@/utils/commonUtils";
import { IAdmin } from "@/migrations/Migration";
import { z } from "zod";
import { serialize } from "cookie";
import Jwt from "jsonwebtoken";

// Define validation schema
const schema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default  async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        // Validate input
        const parseResult = schema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json(responseStructure(false, "Invalid input", parseResult.error.format()));
        }

        const { email, password } = parseResult.data;

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT * FROM \`admins\` WHERE email=?`, [email]);
        
        if (!(rows as IAdmin[]).length) {
            return res.status(404).json(responseStructure(false, "Email or Password is incorrect"));
        }

        const user: IAdmin = (rows as IAdmin[])[0];

        if (!verifyHashString(user.password, password)) {
            return res.status(404).json(responseStructure(false, "Email or Password is incorrect"));
        }

        const secret_key = process.env.SECRET_KEY || "pickify";

        const token = Jwt.sign({ id: user.id }, secret_key);
        const cookie = serialize("adminAuthToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userData } = user;
        
            res.setHeader("Set-Cookie", cookie);

            return res.status(200).json(responseStructure(true, "Successfully Logged In", {userData:userData}));
        }
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}