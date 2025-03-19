'use client';
import React  from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CustomCard from "./CustomCard";
import { IProduct } from "@/interfaces/modelInterface";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

const ProductCard = ({ data }: { data: IProduct }) => {
  const images = data?.images  ? data?.images?.split(",") : [];
  console.log(process.env.NEXT_PUBLIC_API_ASSETS_URL);
  return (
    <CustomCard>
      <Link href={`/products/details?product=${data?.name}&product_id=${data?.id}`} className="block">
        <div className="relative w-full h-48 rounded-md overflow-hidden">
          <Swiper spaceBetween={10} autoplay={{ delay: 1000, disableOnInteraction: false }} slidesPerView={1}  className="w-full  h-full" pagination={{ clickable: true }}>
            {Array.isArray(images) && images.length  > 0 && images.map((img, index) => {
              return   (<SwiperSlide key={index}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_ASSETS_URL}/products/${img}`}
                  alt={`product-${index}`}
                  fill={true}
                  unoptimized
                  className="rounded-md object-cover"
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </SwiperSlide>)
            })}
            {(!images || (Array.isArray(images) &&  images.length  ===  0)) &&
            <Image
              src={`/assets/mainAssets/logos/logo.png`}
              alt={`product`}
              fill={true}
              className="rounded-md object-cover"
              sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            }
          </Swiper>
        </div>

        <h3 className="text-lg font-semibold mt-2 text-gray-900">{data?.name.split('').splice(0,20).join('') + '...'}</h3>
        <p className="text-gray-600 text-sm mt-1">{data?.description?.split('').splice(0,30).join("") + '...'}</p>
        <div className="flex items-center mt-2">
          <span className="font-bold text-blue-500">
            ₹{data?.price - data?.discount} <small  className="line-through  text-gray-500">(₹{data?.price})</small>
          </span>
          <span className="ml-auto flex items-center gap-1">
            {[...Array(5)].map((_, i) => {
              if(i <  data?.average_rating)
                return <Star key={i} size={16} fill="#FACC15" stroke="#FACC15" />
              else
                return <Star key={i} size={16} fill="#6B7280" stroke="#6B7280" />
            })}
          </span>
        </div>
      </Link>
      <button className="w-full mt-3 bg-pink-600 text-white py-2 text-sm font-semibold rounded-md hover:bg-pink-700 transition">
        View Product
      </button>
    </CustomCard>
  );
};

export default ProductCard;