import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IComment, IProduct, IUser } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";
import { z } from "zod";  // Import Zod for validation

// Define validation schema
const productUpdateSchema = z.object({
    id: z.number({ invalid_type_error: "Product ID must be a number" }).positive(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const parsedData = productUpdateSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json(responseStructure(false, "Invalid Form Data",parsedData.error.format()));
        }

        const { id } = parsedData.data;

        const mysqlDb = await dbConnection;

        const [rows] = await mysqlDb.execute(`SELECT 
                products.*, 
                categories.id AS category_id, 
                categories.name AS category_name, 
                categories.image AS category_image, 
                categories.is_active AS category_is_active, 
                sub_categories.id AS sub_category_id, 
                sub_categories.name AS sub_category_name, 
                sub_categories.image AS sub_category_image, 
                sub_categories.is_active AS sub_category_is_active 
            FROM products 
            LEFT JOIN categories ON categories.id = products.category 
            LEFT JOIN sub_categories ON sub_categories.id = products.sub_category 
            WHERE products.id = ?`, [id]) as RowDataPacket[];
        
        if (!(rows as ICustomProductResponse[]).length) {
            return res.status(404).json(responseStructure(false, "No Product found"));
        }

        const product = (rows as ICustomProductResponse[])[0];

        const [commentRows] = await mysqlDb.execute(
            `SELECT 
                comments.*,

            -- Comment Details
                users.id AS user_id,
                users.name AS user_name,
                users.image AS user_image

            FROM comments
            LEFT JOIN users ON users.id = comments.user_id
            WHERE comments.product_id=?`,
            [product.id]
        ) as RowDataPacket[];

        const comments = (commentRows as ICustomCommentResponse[]).map((row) =>({
            id: row.id,
            order_id: row.order_id,
            user_id: {
                id:  row.user_id,
                name: row.user_name,
                image: row.user_image
            },
            comment: row.comment,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }))

        const productDetails = {
            id: product.id,
            name: product.name,
            images: product.images,
            description: product.description,
            specification: product.specification,
            category: {
                id: product.category_id,
                name: product.category_name,
                image: product.category_image,
                is_active: product.category_is_active,
            },
            sub_category: product.sub_category_id
                ? {
                      id: product.sub_category_id,
                      name: product.sub_category_name,
                      image: product.sub_category_image,
                      is_active: product.sub_category_is_active,
                  }
                : null,
            price: product.price,
            discount: product.discount,
            views: product.views,
            average_rating: product.average_rating,
            sum_rating: product.sum_rating,
            number_of_users_rate: product.number_of_users_rate,
            is_active: product.is_active,
            created_at: product.created_at,
            updated_at: product.updated_at,
            comments,
        };

        return res.status(200).json(responseStructure(true, "Successfully Updated Product",{productDetails}));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);

interface ICustomProductResponse extends IProduct {
    category_id: number;
    category_name: string;
    category_image: string;
    category_is_active: number;
    sub_category_id?: number;
    sub_category_name?: string;
    sub_category_image?: string;
    sub_category_is_active?: number;
}

interface ICustomCommentResponse extends IComment {
    user_id: IUser;
    user_name: string;
    user_image: string;
    product_id: IProduct;
    category_id: number;
    category_name: string;
    subcategory_id: number;
    subcategory_name: string;
}