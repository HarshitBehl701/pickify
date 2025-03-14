import type { NextApiRequest, NextApiResponse } from "next";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { IUser } from "@/interfaces/modelInterface";
import { authMiddleware } from "@/middlewares/authMiddleware";

async function handler(req: ICustomApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json(responseStructure(false, "Method Not Allowed"));
        }

        const user = req.user;
        if (!user) {
            return res.status(401).json(responseStructure(false, "Unauthorized"));
        }

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(
            `SELECT 
                whislist.id, whislist.is_active, whislist.created_at, whislist.updated_at,
                products.id AS product_id, products.name, products.images, products.description, 
                products.price, products.discount, products.is_active AS product_is_active, 
                categories.id AS category_id, categories.name AS category_name,
                sub_categories.id AS sub_category_id, sub_categories.name AS sub_category_name
            FROM user_whislist AS whislist
            LEFT JOIN products ON whislist.product_id = products.id
            LEFT JOIN categories ON products.category = categories.id
            LEFT JOIN sub_categories ON products.sub_category = sub_categories.id
            WHERE whislist.user_id = ? AND  whislist.is_active=?`,
            [user.id,1]
        );

        if (!(rows  as IUserWishlistResponse[]).length) {
            return res.status(404).json(responseStructure(false, "No whislist items found"));
        }


        const wishlist = (rows as  IUserWishlistResponse[]).map((item) => ({
            id: item.id,
            is_active: item.is_active,
            created_at: item.created_at,
            updated_at: item.updated_at,
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
                sub_category: item.sub_category_id ? {
                    id: item.sub_category_id,
                    name: item.sub_category_name,
                } : null,
            },
        }));
        return res.status(200).json(responseStructure(true, "Successfully fetched wishlist", wishlist));
    } catch (error) {
        return res.status(500).json(responseStructure(false, handleCatchErrors(error)));
    }
}

export default authMiddleware(handler);

interface ICustomApiRequest extends NextApiRequest {
    user?: IUser;
}

export interface IUserWishlistResponse {
    id: number;
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
