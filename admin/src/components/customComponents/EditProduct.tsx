import React, { useState } from "react";
import axios from "axios";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { IProduct } from "@/migrations/Migration";
import { Pen } from "lucide-react";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional(),
  specification: z.string().optional(),
  category: z
    .number({ invalid_type_error: "Category ID must be a number" })
    .positive()
    .optional(),
  sub_category: z.string().optional(),
  price: z
    .number({ invalid_type_error: "Price must be a valid number" })
    .positive()
    .optional(),
  discount: z.number().min(0, "Discount cannot be negative").optional(),
});

const EditProduct = ({
  productData,
  field,
}: {
  productData: IProduct;
  field: 'name'|'description'|'specifications'|'price'|'discount';
}) => {
  const [formData, setFormData] = useState({} as IProduct);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    try {
      await axios.post(
        "/api/products/manage_product",
        { ...formData, id: productData?.id },
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
              {field === "name" && (
                <>
                  <label
                    htmlFor="name"
                    className="font-semibold  text-sm  mb-1 block"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className="w-full p-3 border rounded-md border-gray-300"
                    value={formData.name ?? productData.name}
                    onChange={handleChange}
                  />
                </>
              )}
              {field === "description" && (
                <>
                  <label
                    htmlFor="description"
                    className="font-semibold  text-sm  mb-1 block"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="description"
                    className="w-full resize-none p-3 border rounded-md border-gray-300"
                    value={
                      formData.description ?? productData.description ?? ""
                    }
                    onChange={handleChange}
                  />
                </>
              )}
              {field === "specifications" && (
                <>
                  <label
                    htmlFor="specifications"
                    className="font-semibold  text-sm  mb-1 block"
                  >
                    Specifications
                  </label>
                  <textarea
                    name="specification"
                    placeholder="specification"
                    className="w-full resize-none p-3 border rounded-md border-gray-300"
                    value={
                      formData.specification ?? productData.specification ?? ""
                    }
                    onChange={handleChange}
                  />
                </>
              )}
              {field === "price" && (
                <>
                  <label
                    htmlFor="price"
                    className="font-semibold  text-sm  mb-1 block"
                  >
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    className="w-full p-3 border rounded-md border-gray-300"
                    value={formData.price ?? productData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: parseInt(e.target.value),
                      }))
                    }
                  />
                </>
              )}
              {field === "discount" && (
                <>
                  <label
                    htmlFor="discount"
                    className="font-semibold  text-sm  mb-1 block"
                  >
                    Discount
                  </label>
                  <input
                    type="number"
                    name="discount"
                    placeholder="discount"
                    className="w-full p-3 border rounded-md border-gray-300"
                    value={formData.discount ?? productData.discount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discount: parseInt(e.target.value),
                      }))
                    }
                  />
                </>
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

export default EditProduct;
