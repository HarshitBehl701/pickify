import React from "react";

const HomeHeader = () => {
  return (
    <section className="relative w-full h-[400px] overlfow-hidden rounded-lg flex items-center justify-center text-center bg-cover bg-center" 
      style={{ backgroundImage: `url('${process.env.NEXT_PUBLIC_API_MAIN_ASSETS_URL}/${process.env.NEXT_PUBLIC_HEADER_IMAGE}')` }}>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 bg-opacity-50 rounded-lg"></div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl px-6 text-white">
        <h1 className="text-4xl font-bold leading-tight md:text-5xl tracking-wider">
          Shop Smart, <span className="text-pink-500">Pickify <span className="secondaryTextColor">Fast!</span></span>
        </h1>
        <p className="mt-4 text-lg text-gray-200">
          Discover the best deals on top-quality products. Your one-stop destination for hassle-free shopping.
        </p>
        <button className="mt-6 px-6 py-3 bg-pink-600 text-white font-semibold rounded-md hover:bg-pink-700 transition cursor-pointer">
            Start Shopping
          </button>
      </div>
    </section>
  );
};

export default HomeHeader;