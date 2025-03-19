import React from "react";

const CategoriesSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="animate-pulse h-28 rounded-lg shadow-lg border border-gray-200 flex items-center justify-center bg-gray-300"
        ></div>
      ))}
    </div>
  );
};

export default CategoriesSkeleton;