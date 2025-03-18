"use client"
import { usePageContext } from "@/context/pageContext";
import { Menu, ShoppingCart, Heart, User, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SearchComponents from "./SearchComponents";
import { useUserContext } from "@/context/userContext";
import { toast, Toaster } from "sonner";
import axios from "axios";

export default function Navbar() {
  const [isDropdownOpen, setIsDropDownOpen] = useState<boolean>(false);
  const [profileDropdown, setProfileDropdown] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<string>("/");
  const { category_subCategory } = usePageContext();
  const { isLoggedIn, userData } = useUserContext();
  const pathName  = usePathname();
  useEffect(() => {
    setCurrentPage(pathName);
  }, [pathName]);

  const  handleLogout  =  useCallback(async () => {
    try {
      await axios.post("/api/users/logout",{},{withCredentials:true});
      toast.success("Successfully Logout");
      setTimeout(() =>  window.location.reload(),500);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "Request failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  },[]);  

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 w-full shadow-lg">
      <div className="container mx-auto px-4 md:py-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Image
            src={"/assets/mainAssets/logos/logoRBG3.png"}
            width={120}
            height={50}
            alt="Pickify"
            className="object-contain h-16 w-auto"
          />
        </div>

        {/* Search Bar */}
        <SearchComponents className="md:flex hidden" />

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <div className="flex justify-center space-x-6 text-lg">
            {currentPage !== "/" && (
              <Link
                href="/"
                className="flex group flex-col  items-center justify-center"
              >
                <Home
                  className="group-hover:text-[#FF4F79] cursor-pointer"
                  size={24}
                />
                <p className="text-xs font-semibold">Home</p>
              </Link>
            )}
            <Link
              href="/user/whislist"
              className="flex flex-col  items-center justify-center"
            >
              <Heart
                className="hover:text-[#FF4F79] cursor-pointer"
                size={24}
              />
              <p className="text-xs font-semibold">Whislist</p>
            </Link>
            <Link
              href="/user/cart"
              className="flex flex-col  items-center justify-center"
            >
              <ShoppingCart
                className="hover:text-[#FF4F79] cursor-pointer"
                size={24}
              />
              <p className="text-xs font-semibold">Cart</p>
            </Link>
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex flex-col items-center justify-center focus:outline-none"
              >
                <User
                  className="hover:text-[#FF4F79] cursor-pointer"
                  size={24}
                />
                <p className="text-xs font-semibold">Profile</p>
              </button>
              {profileDropdown && (
                <div className="absolute   text-sm right-0 mt-2 bg-white text-black shadow-lg w-40 p-3 rounded-lg">
                  <ul>
                    {isLoggedIn && (
                      <>
                      <li className="text-[#FF4F79]">
                        {userData?.name}
                      </li>
                        <li>
                          <Link
                            href="/user/profile"
                            className="block p-2 cursor-pointer hover:text-[#FF4F79]"
                          >
                            View Profile
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/user/orders"
                            className="block p-2 cursor-pointer hover:text-[#FF4F79]"
                          >
                            Orders
                          </Link>
                        </li>
                        <li>
                          <button className="block p-2 text-left w-full cursor-pointer text-red-500"  onClick={handleLogout}>
                            Logout
                          </button>
                        </li>
                      </>
                    )}
                    <li>
                      {!isLoggedIn && (
                        <Link
                          href="/login"
                          className="block p-2 cursor-pointer hover:text-[#FF4F79]"
                        >
                          Login/Register
                        </Link>
                      )}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <button
            className="md:hidden text-2xl"
            onClick={() => setIsDropDownOpen(!isDropdownOpen)}
          >
            {isDropdownOpen ? "X" : <Menu />}
          </button>
        </div>
      </div>

      {/* Desktop Categories Dropdown */}
      <ul className="hidden md:flex justify-center space-x-8 text-sm bg-gray-800 p-3">
        {Array.isArray(category_subCategory) &&
          category_subCategory.length > 0 &&
          category_subCategory.map((category, index) => (
            <li key={index} className="relative">
              <button
                className="hover:text-[#FF4F79] cursor-pointer focus:outline-none"
                onClick={() =>
                  setDropdownOpen(dropdownOpen === index ? null : index)
                }
                onMouseEnter={() =>
                  setDropdownOpen(dropdownOpen === index ? null : index)
                }
              >
                {category.name}
              </button>
              {dropdownOpen === index && (
                <div
                  className="absolute left-0 mt-2 bg-white text-black shadow-lg w-48 p-3"
                  onMouseLeave={() => setDropdownOpen(null)}
                >
                  <ul>
                    {category.sub_categories.map((sub, i) => (
                      <li key={i}>
                        <Link
                          href={`/products?sub_category=${sub.name}`}
                          className="block hover:text-[#FF4F79] p-1"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
      </ul>

      {/* Mobile Menu */}
      {isDropdownOpen && (
        <div className="md:hidden bg-gray-900 text-white p-4 space-y-4">
          {/* Search Bar */}
          <SearchComponents className="w-full" />

          {/* Categories */}
          <ul className="space-y-2">
            {Array.isArray(category_subCategory) &&
              category_subCategory.length > 0 &&
              category_subCategory.map((category, index) => (
                <li key={index}>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                    onClick={() =>
                      setDropdownOpen(dropdownOpen === index ? null : index)
                    }
                  >
                    {category.name}
                  </button>
                  {dropdownOpen === index && (
                    <ul className="bg-gray-800 p-2 mt-2">
                      {category.sub_categories.map((sub, i) => (
                        <li key={i}>
                          <Link
                            href={`/products?sub_category=${sub.name}`}
                            className="block hover:text-[#FF4F79] p-2"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}
      <Toaster />
    </nav>
  );
}
