'use client';
import CustomSelect from "@/components/customComponents/CustomSelect";
import {
  ICategoryWithSubCategoryResponse,
  ISubCategory,
} from "@/migrations/Migration";
import axios from "axios";
import Image from "next/image";
import {
  useState,
  ChangeEvent,
  useCallback,
  FormEvent,
  useEffect,
} from "react";
import { toast } from "sonner";
import { z } from "zod";

interface FormData {
  name: string;
  description: string;
  specifications: string;
  price: string;
  discount: string;
  category: string;
  subcategory: string;
  images: File[];
}

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  specifications: z.string().min(1, "Specifications are required"),
  price: z.string().min(1, "Price is required"),
  discount: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  images: z.array(z.instanceof(File)).min(1, "At least one image is required"),
});

const AddProductForm = () => {
  const [step, setStep] = useState<number>(1);
  const [categories, setCategories] = useState<
    ICategoryWithSubCategoryResponse[] | null
  >(null);
  const [selectedCategory, setSelectedCategory] = useState<{
    value: unknown;
    display: string;
  }>({} as { value: unknown; display: string });
  const [subCategories, setSubCategories] = useState<ISubCategory[] | null>(
    null
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<{
    value: unknown;
    display: string;
  }>({} as { value: unknown; display: string });
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    specifications: "",
    price: "",
    discount: "",
    category: "",
    subcategory: "",
    images: [],
  });

  useEffect(() => {
    if (categories === null) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/main/all_category_subcategory",
            {},
            { withCredentials: true }
          );
          setCategories(response.data.data);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          setCategories([]);
        }
      })();
    }
  }, [categories]);

  useEffect(() => {
    if (selectedCategory.value && categories) {
      const selectedCategoryTemp: ICategoryWithSubCategoryResponse[] =
        categories.filter(
          (category) => category.id === (selectedCategory.value as number)
        );
      setSubCategories(selectedCategoryTemp[0].sub_categories);
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    if (selectedCategory.value)
      setFormData((prev) => ({
        ...prev,
        category: (selectedCategory.value as number).toString(),
      }));
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubCategory.value)
      setFormData((prev) => ({
        ...prev,
        subcategory: (selectedSubCategory.value as number).toString(),
      }));
  }, [selectedSubCategory]);


  const validateStep = useCallback(() => {
    let schema;
    switch (step) {
      case 1:
        schema = productSchema.pick({ name: true, description: true });
        break;
      case 2:
        schema = productSchema.pick({ specifications: true, price: true, discount: true });
        break;
      case 3:
        schema = productSchema.pick({ category: true, subcategory: true });
        break;
      case 4:
        schema = productSchema.pick({ images: true });
        break;
      case 5:
        schema = productSchema;
        break;
      default:
        return true;
    }
    const result = schema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return false;
    }
    return true;
  },[formData,step]);

  const handleNext = useCallback(() => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  }, [validateStep]);

  const handlePrev = useCallback(() => {
    setStep((prev) => prev - 1);
  }, []);

  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    },
    [formData]
  );

  const handleImageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        if (formData.images.length + files.length > 5) {
          alert("You can only upload up to 5 images.");
          return;
        }
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...files].slice(0, 5),
        }));
      }
    },
    [formData.images]
  );
  
  const handleRemoveImage = useCallback(
    (index: number) => {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    },
    []
  );

  const handleFormSubmit = useCallback(
    async (ev: FormEvent) => {
      ev.preventDefault();
      if(validateStep())
      {
        try {
          const newFormData = new FormData();
          newFormData.append('name',formData.name)
          newFormData.append('description',formData.description)
          newFormData.append('specifications',formData.specifications)
          newFormData.append('price',formData.price)
          newFormData.append('discount',formData.discount)
          newFormData.append('category',formData.category)
          newFormData.append('subcategory',formData.subcategory)
          formData.images.forEach(img =>  {
            newFormData.append('images[]',img)
          })

          await  axios.post("/api/products/create_product",newFormData,{
            withCredentials:true,
            headers: { "Content-Type": "multipart/form-data" }
          });
          toast.success("Successfully  Added New Product");
          setTimeout(() => window.location.reload(),1000);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            toast.error(error.response.data?.message || "Something  Went   Wrong");
          } else {
            toast.error("An unexpected error occurred");
          }
        }
      }
    },
    [formData,validateStep]
  );

  return (
    <>
      <h1 className="font-semibold text-2xl">Add New Product</h1>
      <div className="w-full h-[90%] flex items-center justify-center">
        <form
          onSubmit={handleFormSubmit}
          className="w-full h-[90%] flex items-center justify-center"
        >
          <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6 w-full max-w-lg mx-auto">
            {/* Pagination Indicator */}
            <div className="flex justify-end mb-4">
              <span className="text-sm font-medium px-3 py-1 rounded bg-gray-800 text-white">
                Step {step} / 5
              </span>
            </div>

            {/* Step 1: Product Name */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Product Name
                </h2>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
                <textarea
                  name="description"
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full mt-3 p-3 border resize-none border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
              </div>
            )}

            {/* Step 2: Description & Price */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Product Details
                </h2>
                <textarea
                  name="specifications"
                  placeholder="Enter product specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  className="w-full p-3 border resize-none border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Enter price"
                  value={formData.price}
                  min={0}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded mt-3 focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
                <input
                  type="number"
                  name="discount"
                  placeholder="Enter discount"
                  value={formData.discount}
                  min={0}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded mt-3 focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
              </div>
            )}

            {/* Step 3: Category & Subcategory */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Category & Subcategory
                </h2>
                {categories && (
                  <CustomSelect
                    options={categories.map((category) => ({
                      value: category.id,
                      display: category.name,
                    }))}
                    label="Select Category"
                    selected={selectedCategory}
                    setSelected={setSelectedCategory}
                  />
                )}
                {subCategories && (
                  <CustomSelect
                    options={subCategories.map((subCategory) => ({
                      value: subCategory.id,
                      display: subCategory.name,
                    }))}
                    label="Select Sub  Category"
                    selected={selectedSubCategory}
                    setSelected={setSelectedSubCategory}
                  />
                )}
              </div>
            )}

            {/* Step 4: Upload Images */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Upload Images (Max 5)
                </h2>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-3"
                  disabled={formData.images.length >= 5}
                />

                {/* Image Previews */}
                <div className="flex flex-wrap gap-4 mt-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative w-24 h-24 border rounded-lg">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Step 5: Review & Submit */}
            {step === 5 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Review Product
                </h2>
                <p>
                  <strong>Name:</strong> {formData.name}
                </p>
                <p>
                  <strong>Description:</strong> {formData.description}
                </p>
                <p>
                  <strong>Price:</strong> ₹{formData.price}
                </p>
                <p>
                  <strong>Category:</strong> {selectedCategory.display}
                </p>
                <p>
                  <strong>Subcategory:</strong> {selectedSubCategory.display}
                </p>
                <div className="flex flex-wrap gap-4 mt-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative w-24 h-24 border rounded-lg">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between">
              <button
                onClick={handlePrev}
                disabled={step === 1}
                type="button"
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
              >
                Previous
              </button>
              {step < 5 ? (
                <button
                  onClick={handleNext}
                  type="button"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddProductForm;
