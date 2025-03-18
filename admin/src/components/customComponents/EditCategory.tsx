'use client';
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { ICategory } from "@/migrations/Migration";

const schema = z.object({
  id: z.number().positive("Invalid category ID"),
  name: z
    .string()
    .min(3, "Category name must be at least 3 characters")
    .optional(),
  is_active: z.number().optional(),
});

const EditCategory = ({ category }: { category: ICategory }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    id: number;
    name: string;
    is_active: 0 | 1;
  }>(
    {} as {
      id: number;
      name: string;
      is_active: 0 | 1;
    }
  );

  useEffect(() => {
    if (Object.keys(formData).length === 0 && category) {
      setFormData({
        id: category.id,
        name: category.name,
        is_active: category.is_active as 0 | 1,
      });
    }
  }, [formData, category]);

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

      try {
        await axios.post("/api/main/category/manage_category", formData, {
          withCredentials: true,
        });
        toast.success("Category updated successfully!");
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data?.message || "Request failed");
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    },
    [formData]
  );


  return (
    <>
      <button
        className="cursor-pointer text-blue-500 rounded-md font-semibold text-sm hover:text-blue-600 transition duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        Edit
      </button>
      {isOpen && (
        <div className="fixed top-0 inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
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
                value={formData?.name ?? category.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />

              <label
                htmlFor="is_active"
                className="font-semibold text-sm mb-1 block"
              >
                Status
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_active"
                    value="1"
                    checked={formData.is_active === 1}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, is_active: 1 }))
                    }
                    className="border-gray-300"
                  />
                  Active
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_active"
                    value="0"
                    checked={formData.is_active === 0}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, is_active: 0 }))
                    }
                    className="border-gray-300"
                  />
                  Inactive
                </label>
              </div>

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

export default EditCategory;
