import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { z } from "zod";
import { IProduct, IUserCart } from "@/interfaces/modelInterface";
import { RowDataPacket } from "mysql2";

// Define validation schema
const placeOrderSchema = z.object({
    cart_id: z.number({ invalid_type_error: "Cart ID must be a number" }).positive(),
});

export async function POST(req: NextRequest) {
    try {
        // Authenticate user
        const user = await authMiddleware(req);
        if (user instanceof NextResponse) {
            return user; // Return 401 Unauthorized if user is not authenticated
        }

        const body = await req.json();
        const parsedData = placeOrderSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json(responseStructure(false, "Invalid Form Data", parsedData.error.format()), { status: 400 });
        }

        const { cart_id } = parsedData.data;
        const mysqlDb = await dbConnection;

        // Check if cart item exists and is active
        const [cartItems] = await mysqlDb.execute(
            `SELECT * FROM user_cart WHERE user_id = ? AND id = ? AND is_active = 1`,
            [user.id, cart_id]
        );

        if ((cartItems as IUserCart[]).length === 0) {
            return NextResponse.json(responseStructure(false, "Cart item not found or already removed"), { status: 400 });
        }

        const { product_id, quantity } = (cartItems as IUserCart[])[0];

        // Check if product exists
        const [productData] = await mysqlDb.execute(
            `SELECT price, discount FROM products WHERE id = ?`,
            [product_id]
        );

        if ((productData as IProduct[]).length === 0) {
            return NextResponse.json(responseStructure(false, "Product not found"), { status: 400 });
        }

        const price = (productData as IProduct[])[0].price - (productData as IProduct[])[0].discount;

        // Insert order into database
        const [orderResult] = await mysqlDb.execute(
            `INSERT INTO orders (user_id, product_id, quantity, price, status, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
            [user.id, product_id, quantity, price, "Pending", 1]
        ) as RowDataPacket[];

        if (orderResult.affectedRows === 0) {
            return NextResponse.json(responseStructure(false, "Failed to place order"), { status: 500 });
        }

        // Deactivate cart item after placing order
        await mysqlDb.execute(
            `UPDATE user_cart SET is_active = 0 WHERE id = ? AND user_id = ?`,
            [cart_id, user.id]
        );

        return NextResponse.json(responseStructure(true, "Order placed successfully"), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}