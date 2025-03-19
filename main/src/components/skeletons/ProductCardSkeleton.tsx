'use client';
import React from "react";
import CustomCard from "../customComponents/mainComponents/CustomCard";

const ProductCardSkeleton = () => {
  return (
    <CustomCard>
      <div className="block animate-pulse">
        {/* Image Skeleton */}
        <div className="relative w-full h-48 bg-gray-300 rounded-md"></div>
        
        {/* Title Skeleton */}
        <div className="mt-3 h-5 bg-gray-300 rounded w-3/4"></div>
        
        {/* Description Skeleton */}
        <div className="mt-2 h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="mt-1 h-4 bg-gray-300 rounded w-2/3"></div>
        
        {/* Price and Rating Skeleton */}
        <div className="flex items-center mt-2">
          <div className="h-5 bg-gray-300 rounded w-1/4"></div>
          <div className="ml-auto flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-4 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Button Skeleton */}
        <div className="w-full mt-3 h-10 bg-gray-300 rounded-md"></div>
      </div>
    </CustomCard>
  );
};

export default ProductCardSkeleton;
