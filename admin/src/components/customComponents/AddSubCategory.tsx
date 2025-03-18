'use client'
import React, { useCallback, useRef, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import Image from "next/image";
import { ICategoryWithSubCategoryResponse } from "@/migrations/Migration";
import CustomSelect from "./CustomSelect";

const schema = z.object({
    name: z.string().min(3, "Sub-category name must be at least 3 characters"),
});

const AddSubCategory = ({categories}:{categories:ICategoryWithSubCategoryResponse[]}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedCategory,setSelectedCategory] = useState<{value:unknown,display:string}>({} as {value:unknown,display:string});
  const [formData, setFormData] = useState<{
    name: string;
    image: File;
  }>(
    {} as {
      name: string;
      image: File;
    }
  );

  const [previews, setPreviews] = useState<string>(
    "/assets/mainAssets/logos/logo.png"
  );

  const fileInputRefs = useRef<HTMLInputElement | null>(null);

  const handleImageClick = useCallback(() => {
    if (fileInputRefs.current) fileInputRefs.current.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setFormData((prev) => ({ ...prev, image: file }));
        setPreviews(URL.createObjectURL(file));
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const result = schema.safeParse(formData);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      } else if (Object.keys(formData).length == 0) {
        toast.error("No Changes made");
        return;
      }

      const newFormData = new FormData();
      newFormData.append("image", formData.image);
      if (formData.name) 
        newFormData.append("name", formData.name);
    if (selectedCategory.value) 
        newFormData.append("category_id", selectedCategory.value.toString());

      try {
        await axios.post("/api/main/sub_category/create_sub_category", newFormData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Sub Category created successfully!");
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data?.message || "Request failed");
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    },
    [formData,selectedCategory]
  );

  return (
    <>
      <button
        className="cursor-pointer bg-blue-500 rounded-md font-semibold text-sm text-white  p-2 hover:bg-blue-600 transition duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        Add Sub Category
      </button>
      {isOpen && (
        <div className="fixed top-0 inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add Sub Category</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative mx-auto flex-col w-fit flex flex-wrap items-center justify-center gap-2">
                <div
                  className="relative group shadow-sm shrink-0 border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
                  onClick={handleImageClick}
                >
                  <Image
                    src={previews}
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
                <p className="font-semibold  text-sm">Sub Category Image</p>
              </div>

                <CustomSelect options={categories.map((category) => ({value:category.id,display:category.name}))} label="Select Category" selected={selectedCategory}   setSelected={setSelectedCategory}  />

              <label
                htmlFor="name"
                className="font-semibold  text-sm  mb-1 block"
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="w-full p-3 border rounded-md border-gray-300"
                value={formData?.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />

              <div className="flex justify-between">
                <button
                  type="button"
                  className="p-3 text-red-400 cursor-pointer rounded-md"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md font-semibold text-sm hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
          <Toaster />
        </div>
      )}
    </>
  );
};

export default AddSubCategory;
