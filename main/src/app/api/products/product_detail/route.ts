import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IProduct, IComment } from "@/interfaces/modelInterface";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

const productDetailsSchema = z.object({
    product_id: z.number({ invalid_type_error: "Product ID must be a number" }).positive(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsedData = productDetailsSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json(responseStructure(false, "Invalid Form Data", parsedData.error.format()), { status: 400 });
        }

        const { product_id } = parsedData.data;
        const mysqlDb = await dbConnection;

        const [productRows] = await mysqlDb.execute(
            `SELECT 
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
            WHERE products.is_active = 1 AND products.id = ?`,
            [product_id]
        ) as RowDataPacket[];

        if ((productRows as ICustomProductResponse[]).length === 0) {
            return NextResponse.json(responseStructure(false, "Product not found"), { status: 404 });
        }

        const product = (productRows as ICustomProductResponse[])[0];

        const [commentRows] = await mysqlDb.execute(
            `SELECT * FROM comments WHERE product_id = ? AND is_active = 1 ORDER BY created_at DESC`,
            [product_id]
        ) as RowDataPacket[];

        const comments: IComment[] = commentRows as IComment[];

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

        return NextResponse.json(responseStructure(true, "Successfully Fetched Product Details", productDetails), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}

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