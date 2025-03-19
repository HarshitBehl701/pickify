import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { RowDataPacket } from "mysql2";
import { z } from "zod";
import { IComment, IProduct, IUser } from "@/interfaces/modelInterface";

const commentSchema = z.object({
    product_id: z.number({ invalid_type_error: "Product ID must be a number" }).positive(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsedData = commentSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json(responseStructure(false, "Invalid Data", parsedData.error.format()), { status: 400 });
        }

        const { product_id } = parsedData.data;
        const mysqlDb = await dbConnection;

        const [productRows] = await mysqlDb.execute(
            `SELECT * FROM products WHERE id = ? AND is_active = 1`,
            [product_id]
        ) as RowDataPacket[];

        if (productRows.length === 0) {
            return NextResponse.json(responseStructure(false, "Product not found"), { status: 404 });
        }

        const [commentsRows] = await mysqlDb.execute(
            `SELECT 
                comments.*, 
                products.id AS product_id, products.name AS product_name, products.images AS product_images,
                products.description AS product_description, products.specification AS product_specification,
                products.price AS product_price, products.discount AS product_discount,
                products.views AS product_views, products.average_rating AS product_average_rating,
                products.sum_rating AS product_sum_rating, products.number_of_users_rate AS product_number_of_users_rate,
                products.is_active AS product_is_active, products.created_at AS product_created_at,
                products.updated_at AS product_updated_at,
                categories.id AS category_id, categories.name AS category_name,
                sub_categories.id AS subcategory_id, sub_categories.name AS subcategory_name,
                users.id AS user_id, users.name AS user_name, users.image AS user_image
            FROM comments
            LEFT JOIN products ON products.id = comments.product_id
            LEFT JOIN users ON users.id = comments.user_id
            LEFT JOIN categories ON categories.id = products.category
            LEFT JOIN sub_categories ON sub_categories.id = products.sub_category
            WHERE comments.product_id=? AND comments.is_active=1`,
            [product_id]
        ) as RowDataPacket[];

        const requiredData = (commentsRows as ICustomCommentResponse[]).map((row) => ({
            id: row.id,
            order_id: row.order_id,
            product_id: {
                id: row.product_id,
                name: row.product_name,
                images: row.product_images,
                description: row.product_description,
                specification: row.product_specification,
                price: row.product_price,
                discount: row.product_discount,
                views: row.product_views,
                average_rating: row.product_average_rating,
                sum_rating: row.product_sum_rating,
                number_of_users_rate: row.product_number_of_users_rate,
                is_active: row.product_is_active,
                created_at: row.product_created_at,
                updated_at: row.product_updated_at,
                category: { id: row.category_id, name: row.category_name },
                subcategory: { id: row.subcategory_id, name: row.subcategory_name }
            },
            user_id: { id: row.user_id, name: row.user_name, image: row.user_image },
            comment: row.comment,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }));

        return NextResponse.json(responseStructure(true, "Comments fetched successfully", { requiredData }), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}

interface ICustomCommentResponse extends IComment {
    user_id: IUser;
    user_name: string;
    user_image: string;
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