import { useState } from "react";
import Image from "next/image";
import Products from "@/components/customComponents/mainComponents/Products";

function ProductDetail() {
  // Sample product data (replace with API call)
  const productData = {
    id: 1,
    name: "Nike Air Max 2024",
    price: 129.99,
    description:
      "Experience the comfort and style of the latest Nike Air Max. Designed for athletes and sneaker lovers alike.",
    images: [
      "/assets/mainAssets/logos/logo.png",
      "/assets/mainAssets/logos/logo2.png",
      "/assets/mainAssets/logos/logo3.png",
    ],
  };

  const [selectedImage, setSelectedImage] = useState(productData.images[0]);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Product Details Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Product Image Gallery */}
        <div>
          <div className="border rounded-lg overflow-hidden">
            <Image
              src={selectedImage}
              width={500}
              height={500}
              alt={productData.name}
              className="object-contain w-full h-auto"
            />
          </div>

          <div className="flex gap-4 mt-4">
            {productData.images.map((img, index) => (
              <Image
                key={index}
                src={img}
                width={80}
                height={80}
                alt="Thumbnail"
                className={`cursor-pointer object-contain border rounded-md ${
                  selectedImage === img ? "border-[#FF4F79]" : "border-gray-300"
                }`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">{productData.name}</h2>
          <p className="text-xl font-bold text-[#FF4F79]">{productData.price}</p>
          <p className="text-gray-700">{productData.description}</p>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-3">
            <button
              className="px-3 py-2 bg-gray-200 rounded-md"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className="text-lg font-medium">{quantity}</span>
            <button
              className="px-3 py-2 bg-gray-200 rounded-md"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button className="bg-[#FF4F79] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e23b62]">
              Add to Cart
            </button>
            <button className="border border-[#FF4F79] text-[#FF4F79] px-6 py-3 rounded-lg font-semibold hover:bg-[#FF4F79] hover:text-white">
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      <h2 className="text-2xl font-semibold mt-12">View Similar Products</h2>
      <Products title="" />
    </div>
  );
}

export default ProductDetail;