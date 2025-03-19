import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import dbConnection from "@/config/db";
import { IProduct } from "@/migrations/Migration";
import { z } from "zod";
import { OkPacket } from "mysql2";
import { authMiddleware } from "@/middlewares/authMiddleware";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const schema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  specifications: z.string().min(1, "Specifications are required"),
  price: z.string().min(1, "Price is required"),
  discount: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req);
    if (authResult.status !== 200) return authResult;

    const formData = await req.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const specifications = formData.get("specifications");
    const price = formData.get("price");
    const discount = formData.get("discount");
    const category = formData.get("category");
    const subcategory = formData.get("subcategory");
    const files = formData.getAll("images[]") as File[];

    // Validate form data
    const parseResult = schema.safeParse({ name, description, specifications, price, discount, category, subcategory });
    if (!parseResult.success) {
      return NextResponse.json(responseStructure(false, "Invalid input", parseResult.error.format()), { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json(responseStructure(false, "No images uploaded"), { status: 400 });
    }

    // Upload images to Cloudinary
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
          { folder: process.env.CLOUDINARY_PRODUCT_FOLDER, public_id: `product_${Date.now()}` },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      const { secure_url } = uploadResponse as { secure_url: string };
      const extractedPath = secure_url.replace(/^.*\/upload\//, "");
      uploadedUrls.push(extractedPath);
    }

    // Database Connection
    const mysqlDb = await dbConnection;

    // Check if Category exists
    const [categoryRows] = await mysqlDb.execute(`SELECT * FROM \`categories\` WHERE id=?`, [category]);
    if (!(categoryRows as IProduct[]).length) {
      return NextResponse.json(responseStructure(false, "No Category found"), { status: 404 });
    }

    // Check if Subcategories exist
    const subCategoryIds = (subcategory as string).split(",").map(Number);
    const [subCategoryRows] = await mysqlDb.execute(
      `SELECT id FROM \`sub_categories\` WHERE id IN (${subCategoryIds.map(() => "?").join(",")})`,
      subCategoryIds
    );

    if ((subCategoryRows as IProduct[]).length !== subCategoryIds.length) {
      return NextResponse.json(responseStructure(false, "One or more Subcategories not found"), { status: 404 });
    }

    // Insert product into database
    const [result] = await mysqlDb.execute(
      `INSERT INTO \`products\` (name, images, description, specification, category, sub_category, price, discount, is_active)  
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [name, uploadedUrls.join(","), description, specifications, category, subcategory, price, discount]
    ) as OkPacket[];

    if (result.affectedRows === 0) {
      return NextResponse.json(responseStructure(false, "Something went wrong"), { status: 400 });
    }

    return NextResponse.json(responseStructure(true, "Successfully created new product"), { status: 201 });

  } catch (error) {
    return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
  }
}