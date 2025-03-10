import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";

function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  const handleLogout = () => {
    console.log("Logging out...");
    // Add your logout logic here
  };

  return (
    <div className="flex min-h-[100dvh]">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white p-5 flex flex-col justify-between transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } transition-transform duration-300 lg:relative lg:translate-x-0`}
      >
        <div>
          {/* Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white lg:hidden"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold mb-5">Admin Panel</h2>
          <ul className="space-y-4">
            <li>
              <Link
                href="/admin/profile"
                className="block p-3 bg-gray-800 rounded hover:bg-gray-700"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="block p-3 bg-gray-800 rounded hover:bg-gray-700"
              >
                Users
              </Link>
            </li>

            {/* Products Dropdown */}
            <li>
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                className="flex justify-between items-center w-full p-3 bg-gray-800 rounded hover:bg-gray-700"
              >
                Products
                <ChevronDown
                  className={`transition-transform ${
                    productsOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {productsOpen && (
                <ul className="mt-2 space-y-2">
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
                onClick={() => setOrdersOpen(!ordersOpen)}
                className="flex justify-between items-center w-full p-3 bg-gray-800 rounded hover:bg-gray-700"
              >
                Orders
                <ChevronDown
                  className={`transition-transform ${
                    ordersOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {ordersOpen && (
                <ul className="mt-2 space-y-2">
                  <li>
                    <Link
                      href="/admin/orders"
                      className="block p-2 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      All Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/orders/pending"
                      className="block p-2 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      Pending Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/orders/completed"
                      className="block p-2 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      Completed Orders
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
          className="flex items-center justify-center w-full p-3 mt-5 text-red-400 hover:bg-red-500 hover:text-white   cursor-pointer rounded font-bold"
        >
          <LogOut className="mr-2" size={20} /> Logout
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Top Navbar for Small Screens */}
        <div className="lg:hidden bg-gray-900 text-white flex items-center justify-between p-4">
          <h2 className="text-xl font-bold">Admin Panel</h2>

          <button
            onClick={() => setSidebarOpen(true)}
            disabled={sidebarOpen}
            className={`transition-opacity ${
              sidebarOpen ? "opacity-50 cursor-not-allowed" : "opacity-100"
            }`}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Main Content */}
        <main className="p-6 bg-white flex-1">{children}</main>
      </div>
    </div>
  );
}

export default AdminDashboardLayout;