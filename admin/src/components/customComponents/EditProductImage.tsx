'use client'
import React, { useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { IProduct } from "@/migrations/Migration";

function EditProductImage({
  product,
  img,
}: {
  product: IProduct;
  img: string;
}) {
  const [selectedFiles, setSelectedFiles] = useState<File | null>(null);
  const [deleteImages, setDeleteImages] = useState<string>("");
  const [previews, setPreviews] = useState<string>("");

  const fileInputRefs = useRef<HTMLInputElement | null>(null);

  const handleImageClick = useCallback(() => {
    if (fileInputRefs.current) fileInputRefs.current.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, prevFileName: string) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedFiles(file);
        setDeleteImages(prevFileName);
        setPreviews(URL.createObjectURL(file));
      }
    },
    []
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFiles) {
      toast.error("Please select an image before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFiles);
    if (product && deleteImages) {
      formData.append("id", product.id.toString());
      formData.append("deleteImage", deleteImages);
    }

    try {
      await axios.post(`/api/products/update_product_image`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile image updated successfully!");
      setTimeout(() => window.location.reload(), 500);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
    }
  }, [selectedFiles, deleteImages, product]);

  return (
    <>
      <div className="relative w-24 h-24">
        <div
          className="relative group shadow-sm shrink-0 border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
          onClick={handleImageClick}
        >
          <Image
            src={previews || `${process.env.NEXT_PUBLIC_API_PRODUCTS_ASSETS_URL}/${img}`}
            width={140}
            height={100}
            alt="Product Image"
            className="transition-opacity duration-200"
          />
          <div className="absolute inset-0 bg-black/80 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-white text-lg font-semibold">📷</span>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={(el) => {
            fileInputRefs.current = el;
          }}
          onChange={(ev) => handleFileChange(ev, img)}
        />
        {previews && (
          <button
            className="cursor-pointer text-green-600 rounded-md font-semibold text-xs hover:text-green-700 transition duration-200"
            onClick={handleUpload}
          >
            Update Image
          </button>
        )}
      </div>
    </>
  );
}

export default EditProductImage;
