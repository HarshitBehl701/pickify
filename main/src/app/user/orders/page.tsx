"use client";
import React, { useCallback } from "react";
import Products from "@/components/customComponents/mainComponents/Products";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { usePageContext } from "@/context/pageContext";
import Link from "next/link";
import { useUserContext } from "@/context/userContext";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";

function Orders() {
  const { products } = usePageContext();
  const { userOrders } = useUserContext();

  const manageOrder = useCallback(
    async (id: number, status: "Cancelled" | "Returned") => {
      if (userOrders) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const response = await axios.post(
            "/api/orders/manage_orders",
            { id: id, status: status },
            { withCredentials: true }
          );
          toast.success(
            `Successfully ${status} ${
              status === "Cancelled" ? "The Order" : "request made"
            }`
          );
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            toast.error(error.response.data?.message || "Request failed");
          } else {
            toast.error("An unexpected error occurred");
          }
        }
      }
    },
    [userOrders]
  );

  return (
    <div className="p-6">
      {/* Orders Section */}
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.isArray(userOrders) &&
          userOrders.length > 0 &&
          userOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow-md border border-gray-200 rounded-lg p-4 flex gap-4 items-center"
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_API_PRODUCTS_ASSETS_URL}/${
                  order.product_id?.images?.split(",")[0]
                }`}
                alt="Product"
                height={96}
                width={96}
                unoptimized
                className="w-24 h-24 object-cover rounded-md"
              />
              <div className="flex-1">
                <p className="text-lg font-semibold">
                  {order.product_id.name.split("").splice(0, 25).join("") +
                    "..."}
                </p>
                <p className="text-gray-500">
                  Status:{" "}
                  <span className="font-medium text-blue-600">
                    {order.status}
                  </span>
                </p>
                <p className="text-gray-700 font-semibold">
                  Total: {order.price}
                </p>
                <Link
                  href={`/products/details?product=${order.product_id.name}&product_id=${order.product_id.id}`}
                  className="text-sm hover:underline text-blue-500"
                >
                  View Product
                </Link>
              </div>
              {["Pending", "Processing", "Shipped", "On Hold"].includes(
                order.status
              ) && (
                <button
                  className="px-4  font-semibold cursor-pointer py-2 text-red-500  hover:underline rounded-md text-sm hover:text-red-600 transition"
                  onClick={() => manageOrder(order.id, "Cancelled")}
                >
                  Cancel Order
                </button>
              )}
              {order.status === "Delivered" && (
                <button
                  className="px-4  font-semibold cursor-pointer py-2 text-red-500  hover:underline rounded-md text-sm hover:text-red-600 transition"
                  onClick={() => manageOrder(order.id, "Returned")}
                >
                  Return Order
                </button>
              )}
            </div>
          ))}
        {(!userOrders || (Array.isArray(userOrders) && userOrders.length ===  0)) && <p className="italic">No  orders...</p>}
      </div>

      {/* Similar Products Section */}
      <h2 className="text-2xl font-semibold mt-12">Explore Other Products</h2>
      {products && <Products title="" productsData={products} />}
      {!products && (
        <div className="grid grid-cols-1 place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-8">
          {Array.from({ length: 4 }).map(() => (
            <ProductCardSkeleton key={Math.random()} />
          ))}
        </div>
      )}
      <Toaster />
    </div>
  );
}

export default Orders;
