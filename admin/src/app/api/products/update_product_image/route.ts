import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { handleCatchErrors, responseStructure } from "@/utils/commonUtils";
import dbConnection from "@/config/db";
import { IProduct } from "@/migrations/Migration";
import { authMiddleware } from "@/middlewares/authMiddleware";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.status !== 200) {
      return authResult;
    }

    const formData = await req.formData();
    const id = formData.get("id");
    const deleteImage = formData.get("deleteImage");
    const file = formData.get("image") as File | null;

    if (!id) {
      return NextResponse.json(responseStructure(false, "Product ID is required"), { status: 400 });
    }

    const mysqlConnection = await dbConnection;
    const [productRows] = await mysqlConnection.execute(`SELECT * FROM \`products\` WHERE id=?`, [id]);

    if ((productRows as IProduct[]).length === 0) {
      return NextResponse.json(responseStructure(false, "No Product Found"), { status: 404 });
    }

    const product = (productRows as IProduct[])[0];
    let oldImages = product.images ? product.images.split(',') : [];

    if (deleteImage) {
      // Remove image from Cloudinary
      const publicId = (deleteImage  as  string).replace(/^v\d+\//, "").replace(/\.[^.]+$/, "");
      await cloudinary.v2.uploader.destroy(publicId);
      oldImages = oldImages.filter(img => img !== deleteImage);
    }

    if (file) {
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
      oldImages.push(extractedPath);
    }

    await mysqlConnection.execute(`UPDATE \`products\` SET \`images\`=? WHERE id=?`, [oldImages.join(","), id]);

    return NextResponse.json(responseStructure(true, "Successfully Updated Product"), { status: 200 });
  } catch (error) {
    return NextResponse.json(responseStructure(false, handleCatchErrors(error)), { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};