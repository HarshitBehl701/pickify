import List from "@/components/customComponents/list";
import React from "react";

const heading: string[] = ["ID", "Product Name", "User", "Quantity", "Price", "Status"];

const sampleOrders: {
  id: number;
  name: string;
  user: string;
  quantity: number;
  price: number;
  status: string;
}[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    user: "John Doe",
    quantity: 2,
    price: 4999,
    status: "Delivered",
  },
  {
    id: 2,
    name: "Smartphone",
    user: "Alice Smith",
    quantity: 1,
    price: 25999,
    status: "Shipped",
  },
  {
    id: 3,
    name: "Gaming Mouse",
    user: "Bob Johnson",
    quantity: 3,
    price: 1999,
    status: "Processing",
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    user: "Emma Watson",
    quantity: 1,
    price: 4999,
    status: "Cancelled",
  },
];

function Orders() {
  return (
    <div>
      <List heading={heading} listTitle="Orders">
        {sampleOrders.map((order) => (
          <tr className="border-b hover:bg-gray-100 transition" key={order.id}>
            <td className="py-3 px-4">{order.id}</td>
            <td className="py-3 px-4">{order.name}</td>
            <td className="py-3 px-4">{order.user}</td>
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
    </div>
  );
}

export default Orders;