"use client"
import EditUserProfile from "@/components/customComponents/EditUserProfile";
import { IUser } from "@/migrations/Migration";
import axios from "axios";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function UserDetail() {
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<IUser | null>(null);
  const user_id = searchParams.get('user_id');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (userData == null && user_id) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/users/user_details",
            { id: parseInt(user_id as string) },
            { withCredentials: true }
          );
          setUserData(response.data.data.userAccount);
        } catch (error) {
          console.warn(error);
        }
      })();
    }
  }, [userData, user_id]);
  
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
    if(userData)
      formData.append("id",userData.id.toString());

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_USER_API}/api/admin/users/update_user_profile`, formData, {
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
    <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">User Details</h2>

      <div className="flex items-center space-x-6">
        {/* User Picture */}
        <div className="relative w-32 h-24 rounded-md overflow-hidden">
        <div
              className="relative group shadow-sm shrink-0 border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
              onClick={handleImageClick}
            >
              <Image
                src={preview || (userData && userData.image ? `${process.env.NEXT_PUBLIC_USER_API_ASSETS_URL}/${userData.image}` : "/assets/mainAssets/logos/logo.png")}
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
        </div>

        {/* UserDetail Info */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700">
            {userData?.name}
          </h3>
          <p className="text-gray-500">{userData?.email}</p>
          <p className="text-gray-500">{userData?.address}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex space-x-4">
        {userData &&  <EditUserProfile userData={userData} />}
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
  );
}

export default UserDetail;
