"use client"
import { IOrder } from "@/migrations/Migration";
import axios from "axios";
import React, { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type IOrderStatus = "Pending"| "Processing"| "Shipped"| "Delivered"| "Cancelled"| "Refunded"| "Failed"| "On Hold"| "Returned";

const  orderStatuses:Record<IOrderStatus,IOrderStatus> = {
  "Pending":"Processing", 
  "Processing":"Shipped", 
  "Shipped":"Delivered", 
  "Returned":"Refunded",
  "Refunded":"Cancelled", 
  "Failed":"On Hold", 
  "On Hold":"Pending",
  "Delivered":"Returned",
  "Cancelled":"Cancelled"

}

const OrderDetails = ({ searchParams }: { searchParams: Promise<{ order_id?: string }> }) => {
  const [formattedDate, setFormattedDate] = useState("");
  const  {order_id}  = use(searchParams);

  const [orderData,setOrderData] = useState<IOrder  | null>(null);
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


  useEffect(() =>{
    if(order_id && orderData == null)
    {
      ;(async() => {
        try {
          const response = await axios.post("/api/orders/order_details",{id:parseInt(order_id as string)},{withCredentials:true});
          setOrderData(response.data.data.requestedData);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
              toast.error(error.response.data?.message || "Request failed");
            } else {
              toast.error("An unexpected error occurred");
            }
        }
      })()
    }
  },[order_id,orderData])

  const manageOrder = useCallback(async({status,is_active}:{status?:IOrderStatus,is_active?:0|1}) => {
    if(order_id   && orderData)
    {
      try {
        const data:{id:number,status?:IOrderStatus,is_active?:0|1} = {id:parseInt(order_id as string)};
        if(status) data.status =  status;
        if(is_active) data.is_active = is_active;
        await axios.post('/api/orders/manage_orders',data,{withCredentials:true});
        toast.success("Successfully  updated order  status");
        setTimeout(() =>  window.location.reload(),1000);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data?.message || "Request failed");
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    }
  },[order_id,orderData]);

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
          <span className="font-medium">{orderData?.id}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Product:</span>
          <span className="font-medium">{orderData?.product_id.name}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Customer Name:</span>
          <span className="font-medium">{orderData?.user_id?.name}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Customer Email:</span>
          <span className="font-medium">{orderData?.user_id?.email}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium">{orderData?.quantity}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Total Price:</span>
          <span className="font-medium">₹{orderData?.price}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-600">Order Status:</span>
          <span
            className={`font-medium ${
              orderData?.status === "Shipped"
                ? "text-blue-600"
                : orderData?.status === "Processing"
                ? "text-yellow-600"
                : orderData?.status === "Delivered"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {orderData?.status}
          </span>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Delivery Address</h3>
        <p className="text-gray-600">
          <strong>{orderData?.user_id?.address}</strong>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap space-x-4">
        {["Pending", "Processing", "Shipped","Refunded","On Hold"].includes(orderData?.status  as string) &&  <>
          <button className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition" onClick={() =>  manageOrder({status:orderStatuses[orderData ? orderData?.status :  'Pending']})}>
          Update Status
        </button>
        <button className="bg-red-600  cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-red-700 transition" onClick={() =>  manageOrder({status:'Cancelled'})}>
          Cancel Order
        </button>
        </>}
        {!["On Hold","Delivered","Cancelled"].includes(orderData?.status  as string) &&  <>
          <button className="bg-green-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"  onClick={() =>  manageOrder({status:'On Hold'})}>
          Mark Hold
        </button>
        </>}
        {
          orderData?.status ===  'Delivered' &&  <button className="bg-red-500 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-red-500 transition"  onClick={() =>  manageOrder({status:'Returned'})}>
          Mark As Returned  Request
        </button>
        }
      </div>
    </div>
  );
};

export default OrderDetails;