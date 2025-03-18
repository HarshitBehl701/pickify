import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";

export async function POST(req: NextRequest) {
    try {
        // Authenticate user
        const user = await authMiddleware(req);
        if (user instanceof NextResponse) {
            return user; // Return 401 Unauthorized if user is not authenticated
        }

        const mysqlDb = await dbConnection;

        // Fetch user's cart items along with product, category, and sub-category details
        const [rows] = await mysqlDb.execute(
            `SELECT 
                cart.id, cart.quantity, cart.is_active, cart.created_at, cart.updated_at,
                products.id AS product_id, products.name, products.images, products.description, 
                products.price, products.discount, products.is_active AS product_is_active, 
                categories.id AS category_id, categories.name AS category_name,
                sub_categories.id AS sub_category_id, sub_categories.name AS sub_category_name
            FROM user_cart AS cart
            LEFT JOIN products ON cart.product_id = products.id
            LEFT JOIN categories ON products.category = categories.id
            LEFT JOIN sub_categories ON products.sub_category = sub_categories.id
            WHERE cart.user_id = ? AND cart.is_active = ?`,
            [user.id, 1]
        );

        if (!(rows as IUserCartResponse[]).length) {
            return NextResponse.json(responseStructure(false, "No cart items found"), { status: 404 });
        }

        // Format the response
        const cart = (rows as IUserCartResponse[]).map((item) => ({
            id: item.id,
            is_active: item.is_active,
            created_at: item.created_at,
            updated_at: item.updated_at,
            quantity: item.quantity,
            product_id: {
                id: item.product_id,
                name: item.name,
                images: item.images,
                description: item.description,
                price: item.price,
                discount: item.discount,
                is_active: item.product_is_active,
                category: {
                    id: item.category_id,
                    name: item.category_name,
                },
                sub_category: item.sub_category_id
                    ? {
                          id: item.sub_category_id,
                          name: item.sub_category_name,
                      }
                    : null,
            },
        }));

        return NextResponse.json(responseStructure(true, "Successfully fetched cart", cart), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}

// Define the TypeScript interface for the cart response
interface IUserCartResponse {
    id: number;
    quantity: number;
    is_active: number;
    created_at: Date;
    updated_at: Date;
    product_id: number;
    name: string;
    images?: string;
    description?: string;
    price: number;
    discount: number;
    product_is_active: number;
    category_id: number;
    category_name: string;
    sub_category_id?: number;
    sub_category_name?: string;
}
