import { NextResponse } from "next/server";
import dbConnection from "@/config/db";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import { RowDataPacket } from "mysql2";

export async function POST() {
    try {
        const mysqlDb = await dbConnection;
        const [rows] = await mysqlDb.execute(`
            SELECT 
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
            ON category.id = sub_category.category_id  
            WHERE category.is_active = 1
        `) as RowDataPacket[];

        if (rows.length === 0) {
            return NextResponse.json(responseStructure(false, "No category found"), { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const categoryMap = new Map<number, any>();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows.forEach((row: { category_id: any; category_name: any; category_image: any; category_is_active: any; category_created_at: string | number | Date; category_updated_at: string | number | Date; sub_category_id: any; sub_category_category_id: any; sub_category_name: any; sub_category_image: any; sub_category_is_active: any; sub_category_created_at: string | number | Date; sub_category_updated_at: string | number | Date; }) => {
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
                categoryMap.get(categoryId).sub_categories.push({
                    id: row.sub_category_id,
                    category_id: row.sub_category_category_id,
                    name: row.sub_category_name,
                    image: row.sub_category_image,
                    is_active: row.sub_category_is_active,
                    created_at: new Date(row.sub_category_created_at),
                    updated_at: new Date(row.sub_category_updated_at),
                });
            }
        });

        const categoriesAndSubCategories = Array.from(categoryMap.values());

        return NextResponse.json(responseStructure(true, "Successfully fetched all categories and subcategories", categoriesAndSubCategories), { status: 200 });

    } catch (error) {
        return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
    }
}