import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { z } from "zod";

// Define schema using Zod
const cartSchema = z.object({
    cart_id: z.number().optional(), // Required for removing
    product_id: z.number().optional(), // Required for adding
    quantity: z.number().min(1).optional(), // Required when adding
    action: z.enum(["add", "remove"]),
});

export async function POST(req: NextRequest) {
    try {
        // Authenticate user
        const user = await authMiddleware(req);
        if (user instanceof NextResponse) {
            return user; // Return 401 Unauthorized if user is not authenticated
        }

        // Parse request body
        const body = await req.json();
        const parsedBody = cartSchema.safeParse(body);

        if (!parsedBody.success) {
            return NextResponse.json(
                responseStructure(false, "Invalid request", parsedBody.error.errors),
                { status: 400 }
            );
        }

        const { cart_id, product_id, quantity, action } = parsedBody.data;
        const mysqlDb = await dbConnection;

        if (action === "remove") {
            if (!cart_id) {
                return NextResponse.json(responseStructure(false, "Cart ID is required for removal"), { status: 400 });
            }

            const [cartItem] = await mysqlDb.execute(
                `SELECT id FROM user_cart WHERE user_id = ? AND id = ?`,
                [user.id, cart_id]
            );

            if (!(cartItem as IUserCart[]).length) {
                return NextResponse.json(responseStructure(false, "Cart item not found"), { status: 400 });
            }

            await mysqlDb.execute(
                `UPDATE user_cart SET is_active = ? WHERE user_id = ? AND id = ?`,
                [0, user.id, cart_id]
            );

            return NextResponse.json(responseStructure(true, "Item removed from cart"), { status: 200 });
        } else {
            if (!product_id) {
                return NextResponse.json(responseStructure(false, "Product ID is required for adding"), { status: 400 });
            }
            if (!quantity || quantity < 1) {
                return NextResponse.json(responseStructure(false, "Quantity must be at least 1"), { status: 400 });
            }

            const [cartItem] = await mysqlDb.execute(
                `SELECT id FROM user_cart WHERE user_id = ? AND product_id = ? AND is_active=1`,
                [user.id, product_id]
            );

            if ((cartItem as IUserCart[]).length !== 0) {
                return NextResponse.json(responseStructure(false, "Item already in cart"), { status: 400 });
            }

            await mysqlDb.execute(
                `INSERT INTO user_cart (user_id, product_id, quantity, is_active) VALUES (?, ?, ?, 1)`,
                [user.id, product_id, quantity]
            );

            return NextResponse.json(responseStructure(true, "Item added to cart"), { status: 200 });
        }
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}

interface IUserCart {
    id: number;
    user_id: number;
    product_id: number;
    quantity: number;
    is_active: number;
}