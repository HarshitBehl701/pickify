import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IUser, IUserCart } from "@/interfaces/modelInterface";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { z } from "zod";

// Define schema using Zod
const cartSchema = z.object({
    cart_id: z.number().optional(), // Required only for removing
    product_id: z.number().optional(), // Required only for adding
    quantity: z.number().min(1).optional(), // Required when adding
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

        // Validate request body
        const parsedBody = cartSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json(responseStructure(false,"Invalid Requests", parsedBody.error.errors));
        }

        const { cart_id, product_id, quantity, action } = parsedBody.data;
        const mysqlDb = await dbConnection;

        if (action === "remove") {
            if (!cart_id) {
                return res.status(400).json(responseStructure(false, "Cart ID is required for removal"));
            }

            const [cartItem] = await mysqlDb.execute(
                `SELECT id FROM user_cart WHERE user_id = ? AND id = ?`,
                [user.id, cart_id]
            );

            if ((cartItem as IUserCart[]).length === 0) {
                return res.status(400).json(responseStructure(false, "Cart item not found"));
            }

            await mysqlDb.execute(
                `UPDATE user_cart SET is_active = ? WHERE user_id = ? AND id = ?`,
                [0, user.id, cart_id]
            );

            return res.status(200).json(responseStructure(true, "Item removed from cart"));
        } else {
            if (!product_id) {
                return res.status(400).json(responseStructure(false, "Product ID is required for adding"));
            }
            if (!quantity || quantity < 1) {
                return res.status(400).json(responseStructure(false, "Quantity must be at least 1"));
            }

            const [cartItem] = await mysqlDb.execute(
                `SELECT id FROM user_cart WHERE user_id = ? AND product_id = ?`,
                [user.id, product_id]
            );

            if ((cartItem as IUserCart[]).length !== 0) {
                return res.status(400).json(responseStructure(false, "Item already in cart"));
            }

            await mysqlDb.execute(
                `INSERT INTO user_cart (user_id, product_id, quantity, is_active) VALUES (?, ?, ?, 1)`,
                [user.id, product_id, quantity]
            );

            return res.status(200).json(responseStructure(true, "Item added to cart"));
        }
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);

interface ICustomApiRequest extends NextApiRequest {
    user?: IUser;
}