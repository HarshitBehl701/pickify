import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IProduct } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";

export interface ICustomProductsResponse extends IProduct {
    category_id: number;
    category_name: string;
    category_image: string;
    category_is_active: number;
    category_created_at: Date;
    category_updated_at: Date;
    sub_category_id: number;
    sub_category_name: string;
    sub_category_image: string;
    sub_category_is_active: number;
    sub_category_created_at: Date;
    sub_category_updated_at: Date;
}

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req);
        if (authResult.status !== 200) {
            return authResult;
        }

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT 
            products.*,
            categories.id AS category_id,
            categories.name AS category_name,
            categories.image AS category_image,
            categories.is_active AS category_is_active,
            categories.created_at AS category_created_at,
            categories.updated_at AS category_updated_at,
            sub_categories.id AS sub_category_id,
            sub_categories.name AS sub_category_name,
            sub_categories.image AS sub_category_image,
            sub_categories.is_active AS sub_category_is_active,
            sub_categories.created_at AS sub_category_created_at,
            sub_categories.updated_at AS sub_category_updated_at
        FROM 
            \`products\`
        LEFT JOIN 
            \`categories\` ON \`categories\`.id = \`products\`.category
        LEFT JOIN 
            \`sub_categories\` ON \`sub_categories\`.id = \`products\`.sub_category
        `);

        if (!(rows as ICustomProductsResponse[]).length) {
            return NextResponse.json(responseStructure(false, "No products found"), { status: 404 });
        }

        const products: ICustomProductsResponse[] = rows as ICustomProductsResponse[];

        const requestedData = products.map((product) => ({
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
            sub_category: {
                id: product.sub_category_id,
                name: product.sub_category_name,
                category_id: product.sub_category_image,
                is_active: product.sub_category_is_active,
            },
            price: product.price,
            discount: product.discount,
            views: product.views,
            average_rating: product.average_rating,
            sum_rating: product.sum_rating,
            number_of_users_rate: product.number_of_users_rate,
            is_active: product.is_active,
            created_at: product.created_at,
            updated_at: product.updated_at,
        }));

        return NextResponse.json(responseStructure(true, "Successfully fetched all products", requestedData), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}