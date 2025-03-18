"use client"
import EditProduct from "@/components/customComponents/EditProduct";
import EditProductCategorySubCategory from "@/components/customComponents/EditProductCategorySubCategory";
import EditProductImage from "@/components/customComponents/EditProductImage";
import { IComment, IProduct } from "@/migrations/Migration";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ICustomProductResponse extends IProduct {
  comments: IComment[];
}

const ProductDetails = ({ searchParams }: { searchParams: Promise<{ product_id?: string }> }) => {
  const [product, setProduct] = useState<ICustomProductResponse | null>(null);
  const [product_id,setProductId] = useState<string | null>(null);

  useEffect(() => {
    ;(async() =>{
      setProductId((await searchParams)?.product_id  as  string)
    })()
  },[searchParams])

  useEffect(() => {
    if (product_id && product == null) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/products/product_details",
            { id: parseInt(product_id as string) },
            { withCredentials: true }
          );
          
          setProduct(response.data.data);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            toast.error(error.response.data?.message || "Request failed");
          } else {
            toast.error("An unexpected error occurred");
          }
        }
      })();
    }
  }, [product_id, product]);

  const manageProductActiveDeactive = useCallback(async () => {
    if (product && product_id) {
      try {
        await axios.post(
          "/api/products/manage_product",
          {
            id: parseInt(product_id as string),
            is_active: product.is_active ? 0 : 1,
          },
          { withCredentials: true }
        );
        toast.success("Successfully updated product status");
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data?.message || "Request failed");
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    }
  }, [product_id, product]);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6 w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
          {product?.is_active ? "Online" : "Offline"}
        </div>

        {/* Product Information */}
        <div className="space-y-3">
          <div className="flex  items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-700">
              {product?.name}
            </h3>
            {product && <EditProduct productData={product} field="name" />}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">{product?.description}</p>
            {product && (
              <EditProduct productData={product} field="description" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <p className="text-gray-600">{product?.specification}</p>
            {product && (
              <EditProduct productData={product} field="specifications" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <p className="text-gray-800 font-medium">
              Price: ₹{product?.price}
            </p>
            {product && <EditProduct productData={product} field="price" />}
          </div>

          <div className="flex items-center gap-2">
            <p className="text-gray-800 font-medium">
              Discount: ₹{product?.discount}
            </p>
            {product && <EditProduct productData={product} field="discount" />}
          </div>
          <div className="text-gray-600">
            <strong>Category:</strong> {product?.category.name} -{" "}
            {product?.sub_category?.name}
            {product && (
              <EditProductCategorySubCategory productData={product} />
            )}
          </div>
        </div>

        {/* Product Images */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Images</h3>
          <div className="flex flex-wrap items-center gap-2">
            {product &&
              product.images &&
              product.images
                .split(",")
                .map((img, index) => (
                  <EditProductImage product={product} img={img} key={index} />
                ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-4">
          <button
            className={`${
              product?.is_active
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } mt-3 cursor-pointer px-4 py-2 text-white rounded-md font-semibold text-sm transition duration-200`}
            onClick={manageProductActiveDeactive}
          >
            {product?.is_active ? "Mark Offline" : "Make Live"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
