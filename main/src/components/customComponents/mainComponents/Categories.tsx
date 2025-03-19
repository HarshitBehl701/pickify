import { usePageContext } from "@/context/pageContext";
import Image from "next/image";
import React from "react";

const Categories = () => {
  const {category_subCategory} = usePageContext();
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Shop by Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.isArray(category_subCategory) && category_subCategory.length > 0 &&  category_subCategory.map((data) => (
          <div
            key={data.name}
            className="group relative h-28  overflow-hidden rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200 flex items-center justify-center"
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_API_ASSETS_URL}/mainAssets/${data.image}`}
              alt={data.name}
              className="object-cover block my-auto mx-auto transition-transform duration-300 group-hover:scale-110"
              width={180}
              unoptimized
              height={120}
            />
            <div className="absolute inset-0 bg-black/85 bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-lg font-semibold">{data.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;