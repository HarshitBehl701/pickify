import React from 'react';
import Products from '@/components/customComponents/mainComponents/Products';
import Image from 'next/image';

function Profile() {
  return (
    <div className="container mx-auto p-6">
      {/* User Profile Section */}
      <div className="bg-white shadow-md border border-gray-200 rounded-lg p-6">
        <div className="flex flex-wrap md:flex-nowrap gap-4 md:items-start items-center md:justify-start justify-center">
          <div className="shadow-sm shrink-0 border border-gray-200 rounded-lg overflow-hidden">
            <Image 
              src="/assets/mainAssets/logos/logo.png" 
              width={220} 
              height={120} 
              alt="User Profile" 
              className="cursor-pointer"
            />
          </div>
          <div className="md:pt-4 shrink">
            <h1 className="text-2xl font-semibold">John Doe</h1>
            <p className="text-gray-500">johndoe@example.com</p>
            <p className="text-gray-500">Delivery Address</p>
            <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold text-sm hover:bg-blue-700 transition duration-200">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <h2 className="text-2xl text-center mt-12 font-semibold">
        Explore Our Products!
      </h2>
      <Products title="" />
    </div>
  );
}

export default Profile;