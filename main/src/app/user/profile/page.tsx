'use client'
import React, { useState, useRef } from "react";
import Products from "@/components/customComponents/mainComponents/Products";
import Image from "next/image";
import { useUserContext } from "@/context/userContext";
import { usePageContext } from "@/context/pageContext";
import EditProfileModal from "@/components/customComponents/mainComponents/EditProfile";
import { toast, Toaster } from "sonner"; // For notifications
import axios from "axios";

function Profile() {
  const { userData } = useUserContext();
  const { products } = usePageContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // Show preview
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      await axios.post("/api/users/upload_image", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile image updated successfully!");
      setSelectedFile(null);
      setPreview(null);
      setTimeout(()=>window.location.reload(),500);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* User Profile Section */}
      {userData && (
        <div className="bg-white shadow-md border border-gray-200 rounded-lg p-6">
          <div className="flex flex-wrap md:flex-nowrap gap-4 md:items-start items-center md:justify-start justify-center">

            <div
              className="relative group shadow-sm shrink-0 border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
              onClick={handleImageClick}
            >
              <Image
                src={preview || (userData.image ? `${process.env.NEXT_PUBLIC_API_USERS_ASSETS_URL}/${userData.image}` : `${process.env.NEXT_PUBLIC_API_MAIN_ASSETS_URL}/${process.env.NEXT_PUBLIC_LOGO_NAME}`)}
                width={140}
                height={100}
                alt="User Profile"
                className="transition-opacity duration-200"
              />
              <div className="absolute inset-0 bg-black/80 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-white text-lg font-semibold">📷</span>
              </div>
            </div>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

            <div className="md:pt-4 shrink">
              <h1 className="text-2xl font-semibold">{userData.name}</h1>
              <p className="text-gray-500">{userData.email}</p>
              <p className="text-gray-500">{userData.address}</p>
              <button
                className="mt-3 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md font-semibold text-sm hover:bg-blue-700 transition duration-200"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </button>

              {/* Upload Button (Appears After Selecting Image) */}
              {preview && (
                <button
                  className="mt-3 ml-3 cursor-pointer px-4 py-2 bg-green-600 text-white rounded-md font-semibold text-sm hover:bg-green-700 transition duration-200"
                  onClick={handleUpload}
                >
                  Update Image
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <h2 className="text-2xl text-center mt-12 font-semibold">Explore Our Products!</h2>
      {products && <Products title="" productsData={products} />}

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
        <Toaster  />
    </div>
  );
}

export default Profile;