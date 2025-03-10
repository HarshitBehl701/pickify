"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";

// Define Category & Subcategory Data
const categories: Record<string, string[]> = {
  Electronics: ["Mobile Phones", "Laptops", "Headphones"],
  Fashion: ["Men's Wear", "Women's Wear", "Accessories"],
  Home: ["Furniture", "Kitchen Appliances", "Decor"],
};

// Define TypeScript Types
interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  subcategory: string;
  images: File[];
}

const AddProductForm = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    images: [],
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "category") {
      setFormData({ ...formData, category: value, subcategory: "" });
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData({ ...formData, images: files });
    }
  };

  return (
    <>
    <h1 className="font-semibold  text-2xl">Add New Product</h1>
      <div className="w-full h-[90%] flex  items-center  justify-center">
      <div className="bg-white shadow-lg border  border-gray-200 rounded-lg p-6 w-full max-w-lg mx-auto">
      {/* Pagination Indicator */}
      <div className="flex justify-end mb-4">
        <span className="text-sm font-medium px-3 py-1 rounded bg-gray-800 text-white">
          Step {step} / 4
        </span>
      </div>

      {/* Step 1: Product Name */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Product Name</h2>
          <input
            type="text"
            name="name"
            placeholder="Enter product name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>
      )}

      {/* Step 2: Description, Price, Category & Subcategory */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Product Details</h2>
          <textarea
            name="description"
            placeholder="Enter product description"
            value={formData.description}
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

          {/* Category Selection */}
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded mt-3 focus:outline-none focus:ring-2 focus:ring-gray-600"
          >
            <option value="">Select Category</option>
            {Object.keys(categories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Subcategory Selection */}
          {formData.category && (
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded mt-3 focus:outline-none focus:ring-2 focus:ring-gray-600"
            >
              <option value="">Select Subcategory</option>
              {categories[formData.category].map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Step 3: Upload Images */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Images</h2>
          <input type="file" multiple onChange={handleImageChange} className="mb-3" />
          <div className="grid grid-cols-3 gap-2 mt-3">
            {formData.images.map((file, index) => (
              <div key={index} className="relative w-24 h-24">
                <Image
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  layout="fill"
                  objectFit="cover"
                  className="rounded border"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Review Product</h2>
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Description:</strong> {formData.description}</p>
          <p><strong>Price:</strong> ₹{formData.price}</p>
          <p><strong>Category:</strong> {formData.category}</p>
          <p><strong>Subcategory:</strong> {formData.subcategory}</p>

          <h3 className="font-semibold mt-4">Images:</h3>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {formData.images.map((file, index) => (
              <div key={index} className="relative w-24 h-24">
                <Image
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  layout="fill"
                  objectFit="cover"
                  className="rounded border"
                />
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
          className={`px-4 py-2 rounded ${
            step === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-600 text-white hover:bg-gray-700"
          }`}
        >
          Previous
        </button>
        {step < 4 ? (
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => alert("Product Added!")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Submit
          </button>
        )}
      </div>
    </div>
    </div>
    </>
  );
};

export default AddProductForm;