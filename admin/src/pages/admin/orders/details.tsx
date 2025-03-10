"use client"; // Ensures the component runs only on the client side

import React, { useEffect, useState } from "react";

const OrderDetails = () => {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    // Format date in client side to avoid hydration issues
    const currentDate = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    setFormattedDate(currentDate.toLocaleDateString("en-US", options));
  }, []);

  // Sample order data
  const order = {
    id: "ORD123456",
    productName: "Wireless Headphones",
    user: {
      name: "John Doe",
      email: "johndoe@example.com",
    },
    quantity: 2,
    price: 4999,
    paymentStatus: "Paid",
    orderStatus: "Shipped",
    deliveryAddress: {
      name: "John Doe",
      street: "123, MG Road",
      city: "New Delhi",
      state: "Delhi",
      zip: "110001",
      country: "India",
      phone: "+91 9876543210",
    },
  };

  return (
    <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-lg">
      {/* Heading */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
        <span className="text-gray-500">{formattedDate}</span>
      </div>

      {/* Order Information */}
      <div className="space-y-4">
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Order ID:</span>
          <span className="font-medium">{order.id}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Product:</span>
          <span className="font-medium">{order.productName}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Customer Name:</span>
          <span className="font-medium">{order.user.name}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Customer Email:</span>
          <span className="font-medium">{order.user.email}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium">{order.quantity}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Total Price:</span>
          <span className="font-medium">₹{order.price}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Payment Status:</span>
          <span
            className={`font-medium ${
              order.paymentStatus === "Paid" ? "text-green-600" : "text-red-600"
            }`}
          >
            {order.paymentStatus}
          </span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Order Status:</span>
          <span
            className={`font-medium ${
              order.orderStatus === "Shipped"
                ? "text-blue-600"
                : order.orderStatus === "Processing"
                ? "text-yellow-600"
                : order.orderStatus === "Delivered"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {order.orderStatus}
          </span>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Delivery Address</h3>
        <p className="text-gray-600">
          <strong>{order.deliveryAddress.name}</strong>
        </p>
        <p className="text-gray-600">{order.deliveryAddress.street}</p>
        <p className="text-gray-600">
          {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zip}
        </p>
        <p className="text-gray-600">{order.deliveryAddress.country}</p>
        <p className="text-gray-600">📞 {order.deliveryAddress.phone}</p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Update Status
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
          Cancel Order
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;