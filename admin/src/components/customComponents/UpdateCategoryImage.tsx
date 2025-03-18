'use client'
import React, { useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ICategory } from "@/migrations/Migration";

function UpdateCategoryImage({
  category,
}: {
    category: ICategory;
}) {
  const [selectedFiles, setSelectedFiles] = useState<File | null>(null);
  const [previews, setPreviews] = useState<string>("");

  const fileInputRefs = useRef<HTMLInputElement | null>(null);

  const handleImageClick = useCallback(() => {
    if (fileInputRefs.current) fileInputRefs.current.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedFiles(file);
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
    if (category) {
      formData.append("id", category.id.toString());
    }

    try {
      await axios.post(`/api/main/category/update_category_image`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Category image updated successfully!");
      setTimeout(() => window.location.reload(), 500);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
    }
  }, [selectedFiles, category]);

  return (
    <>
      <div className="relative  w-fit flex flex-wrap items-center justify-center gap-2">
        <div
          className="relative group shadow-sm shrink-0 border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
          onClick={handleImageClick}
        >
          <Image
            src={previews || `/assets/mainAssets/main/${category.image}`}
            width={120}
            height={100}
            alt="Category Image"
            className="transition-opacity w-20 h-20 object-cover duration-200"
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
          onChange={(ev) => handleFileChange(ev)}
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

export default UpdateCategoryImage;
