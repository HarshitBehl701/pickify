"use client"
import List from "@/components/customComponents/list";
import { IOrder } from "@/migrations/Migration";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

function Orders() {
  const [orders, setOrders] = useState<
    IOrder[] | null
  >(null);
  const router = useRouter();
  const [currentItems, setCurrentItems] = useState<IOrder[] | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<
    IOrder[] | null
  >(null);

  const heading: string[] = useMemo(
    () => ["ID", "Product Name", "User", "Quantity", "Price", "Status"],
    []
  );

  const [indexOfFirstItem, setIndexOfFirstItem] = useState<number | null>(null);
  const [indexOfLastItem, setIndexOfLastItem] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (orders == null) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/orders/get_all_orders",
            {},
            { withCredentials: true }
          );
          setOrders(response.data.data);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          setOrders([]);
        }
      })();
    }
  }, [orders]);

  useEffect(() => {
    setFilteredOrders(
      orders
        ? orders.filter((order) =>
            order.id ===  parseInt(search.toLowerCase()) ||
            order.product_id.name.toLowerCase().includes(search.toLowerCase())  || 
            order.user_id.name.toLowerCase().includes(search.toLowerCase()) || 
            order.product_id.category.name.toLowerCase().includes(search.toLowerCase())
          )
        : []
    );
  }, [search, orders]);

  useEffect(() => {
    setIndexOfLastItem(currentPage * itemsPerPage);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (indexOfLastItem) setIndexOfFirstItem(indexOfLastItem - itemsPerPage);
  }, [indexOfLastItem, itemsPerPage]);

  useEffect(() => {
    if (
      filteredOrders &&
      indexOfFirstItem !== null &&
      indexOfLastItem !== null
    ) {
      setCurrentItems(
        filteredOrders.slice(indexOfFirstItem, indexOfLastItem)
      );
    }
  }, [
    filteredOrders,
    currentPage,
    itemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
  ]);

  return (
    <div>
      {currentItems &&
      Array.isArray(currentItems) &&
      currentItems.length > 0 ? (
        <List
          heading={heading}
          listTitle="Orders"
          search={search}
          setSearch={setSearch}
        >
          {indexOfFirstItem !== null &&
            currentItems.map((order) => (
              <tr className="border-b hover:bg-gray-100 cursor-pointer transition" key={order.id} onClick={() => router.push(`/admin/orders/details?order_id=${order.id}&product=${order.product_id.name}`)}>
              <td className="py-3 px-4">{order.id}</td>
              <td className="py-3 px-4">{order.product_id.name}</td>
              <td className="py-3 px-4">{order.user_id.name}</td>
              <td className="py-3 px-4">{order.quantity}</td>
              <td className="py-3 px-4">₹{order.price}</td>
              <td
                className={`py-3 px-4 font-medium ${
                  order.status === "Delivered"
                    ? "text-green-600"
                    : order.status === "Shipped"
                    ? "text-blue-600"
                    : order.status === "Processing"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {order.status}
              </td>
            </tr>
            ))}
        </List>
      ) : (
        <p className="italic">No Orders...</p>
      )}
      {indexOfLastItem !== null &&
        filteredOrders &&
        currentItems &&
        currentItems.length > 0 && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 cursor-pointer hover:underline text-sm rounded mx-1"
            >
              Prev
            </button>
            <span className="px-4 py-2">{currentPage}</span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  indexOfLastItem < filteredOrders.length ? prev + 1 : prev
                )
              }
              disabled={indexOfLastItem >= filteredOrders.length}
              className="px-3 font-semibold cursor-pointer text-sm  text-white bg-black rounded mx-1"
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}

export default Orders;