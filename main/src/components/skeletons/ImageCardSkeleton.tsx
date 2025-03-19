import React from "react";
import CustomCard from "../customComponents/mainComponents/CustomCard";

const ImageCardSkeleton = () => {
  return (
    <CustomCard customCss="p-0 h-72 animate-pulse">
      <div className="relative w-full h-full bg-gray-300 rounded-md"></div>
    </CustomCard>
  );
};

export default ImageCardSkeleton;