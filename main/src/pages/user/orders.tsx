import React from 'react';
import Products from '@/components/customComponents/mainComponents/Products';
import Image from 'next/image';

const orders = [
  {
    id: 'ORD12345',
    date: 'March 10, 2025',
    status: 'Shipped',
    total: '$99.99',
    image: '/assets/mainAssets/logos/logo.png',
  },
  {
    id: 'ORD67890',
    date: 'March 5, 2025',
    status: 'Delivered',
    total: '$49.99',
    image: '/assets/mainAssets/logos/logo.png',
  },
  {
    id: 'ORD12345',
    date: 'March 10, 2025',
    status: 'Shipped',
    total: '$99.99',
    image: '/assets/mainAssets/logos/logo.png',
  },
  {
    id: 'ORD67890',
    date: 'March 5, 2025',
    status: 'Delivered',
    total: '$49.99',
    image: '/assets/mainAssets/logos/logo.png',
  },
];

function Orders() {
  return (
    <div className="p-6">
      {/* Orders Section */}
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {orders.map((order) => (
          <div key={order.id} className="bg-white shadow-md border border-gray-200 rounded-lg p-4 flex gap-4 items-center">
            <Image
              src={order.image}
              alt="Product"
              height={96}
              width={96}
              className="w-24 h-24 object-cover rounded-md"
            />
            <div className="flex-1">
              <p className="text-lg font-semibold">{order.id}</p>
              <p className="text-gray-500">Date: {order.date}</p>
              <p className="text-gray-500">Status: <span className="font-medium text-blue-600">{order.status}</span></p>
              <p className="text-gray-700 font-semibold">Total: {order.total}</p>
            </div>
            <button className="px-4  font-semibold cursor-pointer py-2 text-red-500  hover:underline rounded-md text-sm hover:text-red-600 transition">
              Cancel Order
            </button>
          </div>
        ))}
      </div>

      {/* Similar Products Section */}
      <h2 className="text-2xl font-semibold mt-12">View Similar Products</h2>
      <Products title="" />
    </div>
  );
}

export default Orders;