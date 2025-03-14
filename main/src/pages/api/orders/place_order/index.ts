import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { z } from "zod";
import { IProduct, IUser, IUserCart } from "@/interfaces/modelInterface";

const placeOrderSchema = z.object({
    cart_id: z.number({ invalid_type_error: "Cart ID must be a number" }).positive(),
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

        const parsedData = placeOrderSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json(responseStructure(false, "Invalid Form Data", parsedData.error.format()));
        }

        const { cart_id } = parsedData.data;
        const mysqlDb = await dbConnection;

        const [cartItems] = await mysqlDb.execute(
            `SELECT * FROM user_cart WHERE user_id = ? AND id = ? AND is_active = 1`,
            [user.id, cart_id]
        ) as RowDataPacket[];

        if ((cartItems as IUserCart[]).length === 0) {
            return res.status(400).json(responseStructure(false, "Cart item not found or already removed"));
        }

        const { product_id, quantity } = (cartItems as IUserCart[])[0];

        const [productData] = await mysqlDb.execute(
            `SELECT price FROM products WHERE id = ?`,
            [product_id]
        ) as RowDataPacket[];

        if ((productData as IProduct[]).length === 0) {
            return res.status(400).json(responseStructure(false, "Product not found"));
        }

        const price = (productData as IProduct[])[0].price - (productData as IProduct[])[0].discount;

        const [orderResult] = await mysqlDb.execute(
            `INSERT INTO orders (user_id, product_id, quantity, price, status, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
            [user.id, product_id, quantity, price, "Pending", 1]
        ) as ResultSetHeader[];

        if (orderResult.affectedRows === 0) {
            return res.status(500).json(responseStructure(false, "Failed to place order"));
        }

        await mysqlDb.execute(
            `UPDATE user_cart SET is_active = 0 WHERE id = ? AND user_id = ?`,
            [cart_id, user.id]
        );

        return res.status(200).json(responseStructure(true, "Order placed successfully"));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);

interface ICustomApiRequest extends NextApiRequest {
    user?: IUser;
}