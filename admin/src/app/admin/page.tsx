'use client';
import Image from "next/image";
import { useUserContext } from "@/context/userContext";

function Profile() {
  const {userData} =  useUserContext();
  return (
    <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-lg">

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Profile</h2>

      <div className="flex items-center space-x-6">
        {/* Profile Picture */}
        <div className="relative w-32 h-24 rounded-md overflow-hidden">
          <Image
            src={"/assets/mainAssets/logos/logo.png"}
            alt="Admin Profile"
            fill={true}
            objectFit="cover"
          />
        </div>

        {/* Profile Info */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700">{userData?.name}</h3>
          <p className="text-gray-500">{userData?.email}</p>
          <p className="text-gray-600 font-medium">Role: Super Admin</p>
        </div>
      </div>

      {/* Buttons */}
      {/* <div className="mt-6 flex space-x-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Edit Profile
        </button>
        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
          Change Password
        </button>
      </div> */}
    </div>
  );
}

export default Profile;