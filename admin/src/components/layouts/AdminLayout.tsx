import { useCallback, useState } from "react";
import Link from "next/link";
import {Menu,X,ChevronDown,LogOut,LayoutDashboard,Users,Package,List,ShoppingCart} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    categories: false,
    products: false,
    orders: false,
  });

  const toggleDropdown = (
    menu: keyof { categories: false; products: false; orders: false }
  ) => {
    setDropdowns((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = useCallback(async () => {
    try {
      await axios.post("api/admin/logout", {}, { withCredentials: true });
      toast.success("Successfully Logged Out");
      setTimeout(() => window.location.reload(), 600);
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response
          ? error.response.data?.message || "Request failed"
          : "An unexpected error occurred";
      toast.error(message);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white p-5 flex flex-col justify-between transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } transition-transform duration-300 lg:relative lg:translate-x-0`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <ul className="space-y-4">
            <li>
              <Link
                href="/admin"
                className="flex items-center p-3 bg-gray-800 rounded hover:bg-gray-700"
              >
                <LayoutDashboard className="mr-2" size={18} /> Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="flex items-center p-3 bg-gray-800 rounded hover:bg-gray-700"
              >
                <Users className="mr-2" size={18} /> Users
              </Link>
            </li>

            {/* Categories Dropdown */}
            <li>
              <button
                onClick={() => toggleDropdown("categories")}
                className="flex justify-between items-center w-full p-3 bg-gray-800 rounded hover:bg-gray-700"
              >
                <span className="flex items-center">
                  <List className="mr-2" size={18} /> Categories
                </span>
                <ChevronDown
                  className={`transition-transform ${
                    dropdowns.categories ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {dropdowns.categories && (
                <ul className="mt-2 space-y-2 ml-4">
                  <li>
                    <Link
                      href="/admin/main/all_categories"
                      className="block p-2 bg-gray-700 rounded hover:bg-gray-800"
                    >
                      All Categories
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/main/all_sub_categories"
                      className="block p-2 bg-gray-700 rounded hover:bg-gray-800"
                    >
                      All Subcategories
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Products Dropdown */}
            <li>
              <button
                onClick={() => toggleDropdown("products")}
                className="flex justify-between items-center w-full p-3 bg-gray-800 rounded hover:bg-gray-700"
              >
                <span className="flex items-center">
                  <Package className="mr-2" size={18} /> Products
                </span>
                <ChevronDown
                  className={`transition-transform ${
                    dropdowns.products ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {dropdowns.products && (
                <ul className="mt-2 space-y-2 ml-4">
                  <li>
                    <Link
                      href="/admin/products"
                      className="block p-2 bg-gray-700 rounded hover:bg-gray-800"
                    >
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/products/add"
                      className="block p-2 bg-gray-700 rounded hover:bg-gray-800"
                    >
                      Add Product
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Orders Dropdown */}
            <li>
              <button
                onClick={() => toggleDropdown("orders")}
                className="flex justify-between items-center w-full p-3 bg-gray-800 rounded hover:bg-gray-700"
              >
                <span className="flex items-center">
                  <ShoppingCart className="mr-2" size={18} /> Orders
                </span>
                <ChevronDown
                  className={`transition-transform ${
                    dropdowns.orders ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {dropdowns.orders && (
                <ul className="mt-2 space-y-2 ml-4">
                  <li>
                    <Link
                      href="/admin/orders"
                      className="block p-2 bg-gray-700 rounded hover:bg-gray-800"
                    >
                      All Orders
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full p-3 mt-5 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer rounded font-bold"
        >
          <LogOut className="mr-2" size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar for Mobile */}
        <div className="lg:hidden bg-gray-900 text-white flex items-center justify-between p-4">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(true)}
            className="transition-opacity"
          >
            <Menu size={24} />
          </button>
        </div>

        <main className="p-6 h-screen overflow-y-auto bg-white flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
