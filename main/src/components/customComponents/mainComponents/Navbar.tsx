import { Menu, Search, ShoppingCart, Heart, User, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isDropdownOpen, setIsDropDownOpen] = useState<boolean>(false);
  const [profileDropdown,setProfileDropdown] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const  router  =  useRouter();
  const [currentPage,setCurrentPage]  =  useState<string>("/");
  
  useEffect(() =>  {
    setCurrentPage(router.pathname); 
  },[router]);

  const categories = [
    {
      name: "Fashion",
      subcategories: ["Men's Clothing", "Women's Clothing", "Footwear"],
    },
    {
      name: "Home & Kitchen",
      subcategories: ["Furniture", "Cookware", "Home Decor", "Storage"],
    },
    {
      name: "Beauty & Health",
      subcategories: ["Skincare", "Makeup", "Hair Care", "Personal Care"],
    },
    {
      name: "Sports & Outdoors",
      subcategories: ["Fitness Equipment", "Outdoor Gear", "Sportswear"],
    },
    {
      name: "Toys & Games",
      subcategories: ["Educational Toys", "Board Games", "Outdoor Play"],
    },
  ];

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      window.location.href = `/products?q=${searchQuery}`;
    }
  };

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
        <div className="hidden md:flex items-center bg-white rounded-lg overflow-hidden w-[40%] border border-gray-300">
          <input
            type="text"
            className="p-2 text-black w-full outline-none"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) =>{
              if(e.key  === 'Enter') handleSearch()
            }}
          />
          <button onClick={handleSearch} className="bg-[#FF4F79] p-3 flex items-center justify-center">
            <Search className="text-white" size={20} />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3">
        <div className="flex justify-center space-x-6 text-lg">
            {currentPage  !== '/'  &&  <Link href="/" className="flex group flex-col  items-center justify-center">
              <Home className="group-hover:text-[#FF4F79] cursor-pointer" size={24} />
              <p className="text-xs font-semibold">Home</p>
            </Link>}
            <Link href="/user/whislist" className="flex flex-col  items-center justify-center">
              <Heart className="hover:text-[#FF4F79] cursor-pointer" size={24} />
              <p className="text-xs font-semibold">Whislist</p>
            </Link>
            <Link href="/user/cart"  className="flex flex-col  items-center justify-center">
              <ShoppingCart className="hover:text-[#FF4F79] cursor-pointer" size={24} />
              <p className="text-xs font-semibold">Cart</p>
            </Link>
               <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex flex-col items-center justify-center focus:outline-none"
              >
                <User className="hover:text-[#FF4F79] cursor-pointer" size={24} />
                <p className="text-xs font-semibold">Profile</p>
              </button>
              {profileDropdown && (
                <div className="absolute   text-sm right-0 mt-2 bg-white text-black shadow-lg w-40 p-3 rounded-lg">
                  <ul>
                    <li>  
                      <Link href="/user/profile" className="block p-2 cursor-pointer hover:text-[#FF4F79]">View Profile</Link>
                    </li>
                    <li>
                      <Link href="/user/orders" className="block p-2 cursor-pointer hover:text-[#FF4F79]">Orders</Link>
                    </li>
                    <li>
                      <button className="block p-2 text-left w-full cursor-pointer text-red-500">Logout</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <button className="md:hidden text-2xl" onClick={() => setIsDropDownOpen(!isDropdownOpen)}>
          {isDropdownOpen ? "X" : <Menu />}
        </button>
        </div>
      </div>

      {/* Desktop Categories Dropdown */}
      <ul className="hidden md:flex justify-center space-x-8 text-sm bg-gray-800 p-3">
        {categories.map((category, index) => (
          <li key={index} className="relative">
            <button
              className="hover:text-[#FF4F79] cursor-pointer focus:outline-none"
              onClick={() => setDropdownOpen(dropdownOpen === index ? null : index)}
              onMouseEnter={() => setDropdownOpen(dropdownOpen === index ? null : index)}
            >
              {category.name}
            </button>
            {dropdownOpen === index && (
              <div className="absolute left-0 mt-2 bg-white text-black shadow-lg w-48 p-3" onMouseLeave={() => setDropdownOpen(null)}>
                <ul>
                  {category.subcategories.map((sub, i) => (
                    <li key={i}>
                      <Link
                        href={`/products?category=${sub.toLowerCase().replace(/ /g, "-")}`}
                        className="block hover:text-[#FF4F79] p-1"
                      >
                        {sub}
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
          <div className="flex items-center bg-white rounded-lg overflow-hidden w-full border border-gray-300">
            <input
              type="text"
              className="p-2 text-black w-full outline-none"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch} className="bg-[#FF4F79] p-3 flex items-center justify-center">
              <Search className="text-white" size={20} />
            </button>
          </div>

          {/* Categories */}
          <ul className="space-y-2">
            {categories.map((category, index) => (
              <li key={index}>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                  onClick={() => setDropdownOpen(dropdownOpen === index ? null : index)}
                >
                  {category.name}
                </button>
                {dropdownOpen === index && (
                  <ul className="bg-gray-800 p-2 mt-2">
                    {category.subcategories.map((sub, i) => (
                      <li key={i}>
                        <Link
                          href={`/products?category=${sub.toLowerCase().replace(/ /g, "-")}`}
                          className="block hover:text-[#FF4F79] p-2"
                        >
                          {sub}
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
    </nav>
  );
}