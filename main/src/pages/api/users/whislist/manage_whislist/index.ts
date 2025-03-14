import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IUser, IUserWishlist } from "@/interfaces/modelInterface";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { z } from "zod";

const wishlistSchema = z.object({
    whislist_id: z.number().optional(), // Required only for removing
    product_id: z.number().optional(),  // Required only for adding
    action: z.enum(["add", "remove"]),
});

async function handler(req: ICustomApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const user = req.user;
        if (!user) {
            return res.status(401).json(responseStructure(false, "Unauthorized"));
        }

        const parsedBody = wishlistSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json(responseStructure(false,"Invalid  Details" ,parsedBody.error.errors));
        }

        const { whislist_id, product_id, action } = parsedBody.data;
        const mysqlDb = await dbConnection;

        if (action === "remove") {
            if (!whislist_id) {
                return res.status(400).json(responseStructure(false, "Wishlist ID is required for removal"));
            }

            const [wishlistItem] = await mysqlDb.execute(
                `SELECT id FROM user_whislist WHERE user_id = ? AND id = ?`,
                [user.id, whislist_id]
            );

            if ((wishlistItem as IUserWishlist[]).length === 0) {
                return res.status(400).json(responseStructure(false, "Wishlist item not found"));
            }

            await mysqlDb.execute(
                `UPDATE user_whislist SET is_active = ? WHERE user_id = ? AND id = ?`,
                [0, user.id, whislist_id]
            );

            return res.status(200).json(responseStructure(true, "Item removed from wishlist"));
        } else {
            if (!product_id) {
                return res.status(400).json(responseStructure(false, "Product ID is required for adding"));
            }

            const [wishlistItem] = await mysqlDb.execute(
                `SELECT id FROM user_whislist WHERE user_id = ? AND product_id = ?`,
                [user.id, product_id]
            );

            if ((wishlistItem as IUserWishlist[]).length !== 0) {
                return res.status(400).json(responseStructure(false, "Item already in wishlist"));
            }

            await mysqlDb.execute(
                `INSERT INTO user_whislist (user_id, product_id, is_active) VALUES (?, ?, 1)`,
                [user.id, product_id]
            );

            return res.status(200).json(responseStructure(true, "Item added to wishlist"));
        }
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);

interface ICustomApiRequest extends NextApiRequest {
    user?: IUser;
}