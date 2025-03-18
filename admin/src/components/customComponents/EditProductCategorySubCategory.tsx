'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import {
  ICategoryWithSubCategoryResponse,
  IProduct,
} from "@/migrations/Migration";
import CustomSelect from "./CustomSelect";
import { Pen } from "lucide-react";

const schema = z.object({
  category: z
    .number({ invalid_type_error: "Category ID must be a number" })
    .positive()
    .optional(),
  sub_category: z.string().optional(),
});

const EditProductCategorySubCategory = ({
  productData,
}: {
  productData: IProduct;
}) => {
  const [category, setCategory] = useState<{ value: unknown; display: string }>(
    { value: productData.category.id, display: productData.category.name }
  );
  const [subCategory, setSubCategory] = useState<{
    value: unknown;
    display: string;
  }>({
    value: productData.sub_category?.id,
    display: productData?.sub_category?.name ?? "",
  });
  const [subCategories, setSubCategories] = useState<
    { value: unknown; display: string }[] | null
  >(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<
    ICategoryWithSubCategoryResponse[] | null
  >(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: { id: number; category: number; sub_category: string } = {} as {
      id: number;
      category: number;
      sub_category: string;
    };

    if (productData.category.id !== (category.value as number))
      data.category = category.value as number;
    if (productData?.sub_category?.id !== (subCategory.value as number))
    {
      if(!data.category) data.category = category.value as number;
      data.sub_category = (subCategory.value as number).toString();
    }

    const result = schema.safeParse(data);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    } else if (Object.keys(data).length == 0) {
      toast.error("No Changes made");
      return;
    }

    try {
      await axios.post(
        "/api/products/manage_product",
        { ...data, id: productData?.id },
        { withCredentials: true }
      );
      toast.success("Product updated successfully!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "Request failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
    if (categories == null && productData) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/main/live_category_subcategory",
            {},
            { withCredentials: true }
          );
          setCategories(response.data.data);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            toast.error(error.response.data?.message || "Request failed");
          } else {
            toast.error("An unexpected error occurred");
          }
        }
      })();
    }
  }, [categories, productData]);

  useEffect(() => {
    if (categories && category) {
      for (let index = 0; index < categories.length; index++) {
        if (categories[index].id === category.value) {
          setSubCategories(
            categories[index].sub_categories.map((sub_category) => ({
              value: sub_category.id,
              display: sub_category.name,
            }))
          );
          break;
        }
      }
    }
  }, [category, categories]);
  return (
    <>
      <button
        className="cursor-pointer text-blue-500 rounded-md font-semibold text-xs hover:text-blue-600 transition duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Pen className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="fixed top-0 inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {categories && (
                <CustomSelect
                  selected={category}
                  setSelected={setCategory}
                  label="Select Category"
                  options={categories.map((category) => ({
                    value: category.id,
                    display: category.name,
                  }))}
                />
              )}

              {categories && subCategories && (
                <CustomSelect
                  selected={subCategory}
                  setSelected={setSubCategory}
                  label="Select Sub  Category"
                  options={subCategories}
                />
              )}

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

export default EditProductCategorySubCategory;
