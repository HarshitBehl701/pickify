'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { useUserContext } from "@/context/userContext";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
  address: z.string().optional(),
});

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { userData, setUserData } = useUserContext();
  const [formData, setFormData] = useState({} as {name?:string,email?:string,password?:string,address?:string});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() =>  {
    if(userData)
        setFormData({name:userData.name,email:userData.email,address:userData.address ?? ''});
  },[userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const result = schema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
  
    const filteredData = Object.fromEntries(
      Object.entries(formData).filter(([key, value]) => key !== "password" || value.trim() !== "")
    );
  
    try {
      const response = await axios.post("/api/users/update_profile", filteredData,{withCredentials:true});
      toast.success("Profile updated successfully!");
      setUserData(response.data.user);
      setTimeout(() => window.location.reload(),1000);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full p-3 border rounded-md border-gray-300"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 border rounded-md border-gray-300"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="New Password"
            className="w-full p-3 border rounded-md border-gray-300"
            value={formData.password}
            onChange={handleChange}
          />
          <textarea
            name="address"
            placeholder="Address"
            className="w-full resize-none p-3 border rounded-md border-gray-300"
            value={formData.address ?? ''}
            onChange={handleChange}
          />
          <div className="flex justify-between">
            <button type="button" className="p-3 text-red-400 cursor-pointer rounded-md" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md font-semibold text-sm hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default EditProfileModal;