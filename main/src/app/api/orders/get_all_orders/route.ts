import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { IOrder, IProduct } from "@/interfaces/modelInterface";

export async function POST(req: NextRequest) {
    try {
        // Authenticate user
        const user = await authMiddleware(req);
        if (user instanceof NextResponse) {
            return user; // Return 401 Unauthorized if user is not authenticated
        }

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(
            `SELECT 
                orders.*, 
                
                -- Product Details
                products.id AS product_id,
                products.name AS product_name,
                products.images AS product_images,
                products.description AS product_description,
                products.specification AS product_specification,
                products.price AS product_price,
                products.discount AS product_discount,
                products.views AS product_views,
                products.average_rating AS product_average_rating,
                products.sum_rating AS product_sum_rating,
                products.number_of_users_rate AS product_number_of_users_rate,
                products.is_active AS product_is_active,
                products.created_at AS product_created_at,
                products.updated_at AS product_updated_at,
                
                -- Category Details
                categories.id AS category_id,
                categories.name AS category_name,
                
                -- Subcategory Details
                sub_categories.id AS subcategory_id,
                sub_categories.name AS subcategory_name
            
            FROM orders
            LEFT JOIN products ON products.id = orders.product_id
            LEFT JOIN categories ON categories.id = products.category
            LEFT JOIN sub_categories ON sub_categories.id = products.sub_category
            WHERE orders.user_id = ? AND orders.is_active = ?`,
            [user.id, 1]
        );

        if (!(rows as ICustomOrdersResponse[]).length) {
            return NextResponse.json(responseStructure(false, "No orders found"), { status: 404 });
        }

        const orders: ICustomOrdersResponse[] = rows as ICustomOrdersResponse[];

        const requestedData = orders.map((order) => ({
            id: order.id,
            status: order.status,
            rating: order.rating,
            quantity: order.quantity,
            price: order.price,
            is_active: order.is_active,
            created_at: order.created_at,
            updated_at: order.updated_at,

            product_id: {
                id: order.product_id,
                name: order.product_name,
                images: order.product_images,
                description: order.product_description,
                specification: order.product_specification,
                price: order.product_price,
                discount: order.product_discount,
                views: order.product_views,
                average_rating: order.product_average_rating,
                sum_rating: order.product_sum_rating,
                number_of_users_rate: order.product_number_of_users_rate,
                is_active: order.product_is_active,
                created_at: order.product_created_at,
                updated_at: order.product_updated_at,
                category: {
                    id: order.category_id,
                    name: order.category_name
                },
                subcategory: {
                    id: order.subcategory_id,
                    name: order.subcategory_name
                }
            }
        }));

        return NextResponse.json(responseStructure(true, "Successfully fetched all orders", requestedData), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}

interface ICustomOrdersResponse extends IOrder {
    product_id: IProduct;
    product_name: string;
    product_images?: string;
    product_description?: string;
    product_specification?: string;
    product_price: number;
    product_discount: number;
    product_views: number;
    product_average_rating: number;
    product_sum_rating: number;
    product_number_of_users_rate: number;
    product_is_active: number;
    product_created_at: Date;
    product_updated_at: Date;
    category_id: number;
    category_name: string;
    subcategory_id: number;
    subcategory_name: string;
}