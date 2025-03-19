import React from "react";
import CustomCard from "./CustomCard";
import Link from "next/link";
import Image from "next/image";

function ImageCard({image,text,link}:{image:string,text:string,link:string}) {
  return (
    <CustomCard customCss="group   p-0 h-72">
      <Link href={link} className="flex items-center justify-center relative w-full h-full rounded-md overflow-hidden">
        <Image
          src={image}
          alt="product"
          height={288}
          unoptimized
          width={120}
          className="transition w-auto shrink-0 object-cover h-full object-center duration-300 ease-in-out group-hover:opacity-50"
        />
        {/* Hover text overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/80 bg-opacity-50 text-white font-semibold">
          {text}
        </div>
      </Link>
    </CustomCard>
  );
}

export default ImageCard;