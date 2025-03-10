import React from "react";
import CustomCard from "./CustomCard";
import Link from "next/link";
import Image from "next/image";

function ImageCard() {
  return (
    <CustomCard customCss="group   p-0 h-72">
      <Link href="/product" className="block relative w-full h-full rounded-md overflow-hidden">
        <Image
          src="/assets/mainAssets/logos/logo.png"
          alt="product"
          layout="fill"
          objectFit="cover"
          className="transition duration-300 ease-in-out group-hover:opacity-50"
        />
        {/* Hover text overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/80 bg-opacity-50 text-white font-semibold">
          View Product
        </div>
      </Link>
    </CustomCard>
  );
}

export default ImageCard;