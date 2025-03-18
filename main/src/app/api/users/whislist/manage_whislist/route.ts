import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IUserWishlist } from "@/interfaces/modelInterface";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { z } from "zod";

const wishlistSchema = z.object({
    whislist_id: z.number().optional(), // Required only for removal
    product_id: z.number().optional(),  // Required only for adding
    action: z.enum(["add", "remove"]),
});

export async function POST(req: NextRequest) {
    try {
        // Authenticate User
        const user = await authMiddleware(req);
        if (user instanceof NextResponse) {
            return user; // Return 401 Unauthorized if user is not authenticated
        }

        const body = await req.json();
        const parsedBody = wishlistSchema.safeParse(body);
        if (!parsedBody.success) {
            return NextResponse.json(responseStructure(false, "Invalid Details", parsedBody.error.errors), { status: 400 });
        }

        const { whislist_id, product_id, action } = parsedBody.data;
        const mysqlDb = await dbConnection;

        if (action === "remove") {
            if (!whislist_id) {
                return NextResponse.json(responseStructure(false, "Wishlist ID is required for removal"), { status: 400 });
            }

            const [wishlistItem] = await mysqlDb.execute(
                `SELECT id FROM user_whislist WHERE user_id = ? AND id = ?`,
                [user.id, whislist_id]
            );

            if ((wishlistItem as IUserWishlist[]).length === 0) {
                return NextResponse.json(responseStructure(false, "Wishlist item not found"), { status: 400 });
            }

            await mysqlDb.execute(
                `UPDATE user_whislist SET is_active = ? WHERE user_id = ? AND id = ?`,
                [0, user.id, whislist_id]
            );

            return NextResponse.json(responseStructure(true, "Item removed from wishlist"), { status: 200 });

        } else {
            if (!product_id) {
                return NextResponse.json(responseStructure(false, "Product ID is required for adding"), { status: 400 });
            }

            const [wishlistItem] = await mysqlDb.execute(
                `SELECT id FROM user_whislist WHERE user_id = ? AND product_id = ?`,
                [user.id, product_id]
            );

            if ((wishlistItem as IUserWishlist[]).length !== 0) {
                return NextResponse.json(responseStructure(false, "Item already in wishlist"), { status: 400 });
            }

            await mysqlDb.execute(
                `INSERT INTO user_whislist (user_id, product_id, is_active) VALUES (?, ?, 1)`,
                [user.id, product_id]
            );

            return NextResponse.json(responseStructure(true, "Item added to wishlist"), { status: 200 });
        }
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}