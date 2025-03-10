import React from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CustomCard from "./CustomCard";

const ProductCard = () => {
  return (
    <CustomCard>
      <Link href={'/product'} className="block">
        <div className="relative w-full h-48 rounded-md overflow-hidden">
          <Image
            src={'/assets/mainAssets/logos/logo.png'}
            alt="product"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <h3 className="text-lg font-semibold mt-2 text-gray-900">Product Name</h3>
        <p className="text-gray-600 text-sm mt-1">Short description of the product</p>
        <div className="flex items-center mt-2">
          <span className="text-xl font-bold text-blue-500">₹3,000</span>
          <span className="ml-auto flex items-center text-yellow-500 gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill="#FACC15" stroke="#FACC15" />
            ))}
          </span>
        </div>
      </Link>
      <button className="w-full mt-3 bg-pink-600 text-white py-2 text-sm font-semibold rounded-md hover:bg-pink-700 transition">
        Add to Cart
      </button>
    </CustomCard>
  );
};

export default ProductCard;