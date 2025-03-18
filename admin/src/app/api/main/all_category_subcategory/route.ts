import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { ICategory, ICategoryWithSubCategoryQueries, ICategoryWithSubCategoryResponse } from "@/migrations/Migration";

export async function POST(req: NextRequest) {
    try {
        const authResult = await authMiddleware(req) as { success: boolean };

        if (!authResult.success) {
            return NextResponse.json(responseStructure(false, "Unauthorized"), { status: 401 });
        }

        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`SELECT 
            category.id AS category_id,
            category.name AS category_name,
            category.image AS category_image,
            category.is_active AS category_is_active,
            category.created_at AS category_created_at,
            category.updated_at AS category_updated_at,
            sub_category.id AS sub_category_id,
            sub_category.category_id AS sub_category_category_id,
            sub_category.name AS sub_category_name,
            sub_category.image AS sub_category_image,
            sub_category.is_active AS sub_category_is_active,
            sub_category.created_at AS sub_category_created_at,
            sub_category.updated_at AS sub_category_updated_at
            FROM \`categories\` category 
            LEFT JOIN \`sub_categories\` sub_category 
            ON \`category\`.id = \`sub_category\`.category_id`);

        if (!(rows as ICategoryWithSubCategoryQueries[]).length) {
            return NextResponse.json(responseStructure(false, "No category found"), { status: 404 });
        }

        const categoryMap = new Map<number, ICategoryWithSubCategoryResponse>();

        (rows as ICategoryWithSubCategoryQueries[]).forEach(row => {
            const categoryId = row.category_id;

            if (!categoryMap.has(categoryId)) {
                categoryMap.set(categoryId, {
                    id: row.category_id,
                    name: row.category_name,
                    image: row.category_image,
                    is_active: row.category_is_active,
                    created_at: new Date(row.category_created_at),
                    updated_at: new Date(row.category_updated_at),
                    sub_categories: [],
                });
            }

            if (row.sub_category_id) {
                categoryMap.get(categoryId)!.sub_categories.push({
                    id: row.sub_category_id,
                    category_id: row.sub_category_category_id as ICategory,
                    name: row.sub_category_name as string,
                    image: row.sub_category_image,
                    is_active: row.sub_category_is_active as number,
                    created_at: new Date(row.sub_category_created_at as Date),
                    updated_at: new Date(row.sub_category_updated_at as Date),
                });
            }
        });

        const categoriesAndSubCategories: ICategoryWithSubCategoryResponse[] = Array.from(categoryMap.values());

        return NextResponse.json(responseStructure(true, "Successfully fetched all categories and subcategories", categoriesAndSubCategories));
    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}