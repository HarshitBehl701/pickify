import Image from "next/image";
import React from "react";

const categories = [
  { name: "Electronics", image: "/assets/mainAssets/logos/logo.png" },
  { name: "Fashion", image: "/assets/mainAssets/logos/logo.png" },
  { name: "Home & Kitchen", image: "/assets/mainAssets/logos/logo.png" },
  { name: "Beauty & Health", image: "/assets/mainAssets/logos/logo.png" },
  { name: "Sports & Outdoors", image: "/assets/mainAssets/logos/logo.png" },
  { name: "Toys & Games", image: "/assets/mainAssets/logos/logo.png" },
];

const Categories = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Shop by Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => (
          <div
            key={index}
            className="group relative h-28  overflow-hidden rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200 flex items-center justify-center"
          >
            <Image
              src={category.image}
              alt={category.name}
              className="object-cover block  my-auto mx-auto transition-transform duration-300 group-hover:scale-110"
              width={70}
              height={120}
            />
            <div className="absolute inset-0 bg-black/85 bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-lg font-semibold">{category.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;