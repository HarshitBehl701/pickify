"use client";
import Footer from "@/components/customComponents/mainComponents/Footer";
import Navbar from "@/components/customComponents/mainComponents/Navbar";
import { PageContextProvider } from "@/context/pageContext";
import { UserContextProvider } from "@/context/userContext";
import {
  ICategoryWithSubCategoryResponse,
  IOrder,
  IProduct,
  IUser,
  IUserCart,
  IUserWishlist,
} from "@/interfaces/modelInterface";
import axios from "axios";
import React, { useEffect, useState } from "react";

function ClientLayout({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<IProduct[] | null>(null);
  const [category_subCategory, setCategory_subCategory] = useState<
    ICategoryWithSubCategoryResponse[] | null
  >(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<IUser | null>(null);
  const [userCart, setUserCart] = useState<IUserCart[] | null>(null);
  const [userWhislist, setUserWhislist] = useState<IUserWishlist[] | null>(
    null
  );
  const [userOrders, setUserOrders] = useState<IOrder[] | null>(null);

  useEffect(() => {
    if (products == null) {
      (async () => {
        try {
          const response = await axios.post("/api/products/all_products");
          setProducts(response.data.data);
        } catch (error) {
          setProducts([]);
          console.warn(error);
        }
      })();
    }
  }, [products]);

  useEffect(() => {
    if (category_subCategory === null) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/main/get_all_category_subcategory"
          );
          setCategory_subCategory(response.data.data);
        } catch (error) {
          setCategory_subCategory([]);
          console.warn(error);
        }
      })();
    }
  }, [category_subCategory]);

  useEffect(() => {
    if (isLoggedIn === null) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/users/user_details",
            {},
            { withCredentials: true }
          );
          setUserData(response.data.data);
          setIsLoggedIn(true);
        } catch (error) {
          setIsLoggedIn(false);
          console.warn(error);
        }
      })();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/users/cart/get_all_carts",
            {},
            { withCredentials: true }
          );
          setUserCart(response.data.data);
        } catch (error) {
          setUserCart([]);
          console.warn(error);
        }
      })();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/users/whislist/get_all_whislist",
            {},
            { withCredentials: true }
          );
          setUserWhislist(response.data.data);
        } catch (error) {
          setUserWhislist([]);
          console.warn(error);
        }
      })();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/orders/get_all_orders",
            {},
            { withCredentials: true }
          );
          setUserOrders(response.data.data);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          setUserOrders([]);
          console.error("Something  Went  Wrong");
        }
      })();
    }
  }, [isLoggedIn]);

  return (
    <PageContextProvider
      products={products}
      setProducts={setProducts}
      category_subCategory={category_subCategory}
      setCategory_subCategory={setCategory_subCategory}
    >
      <UserContextProvider
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        userData={userData}
        setUserData={setUserData}
        userCart={userCart}
        setUserCart={setUserCart}
        userWhislist={userWhislist}
        setUserWhislist={setUserWhislist}
        userOrders={userOrders}
        setUserOrders={setUserOrders}
      >
        <div>
          <Navbar />
          <div className="main w-[95%] mx-auto py-10 min-h-[90dvh] w-container">
            {children}
          </div>
          <Footer />
        </div>
      </UserContextProvider>
    </PageContextProvider>
  );
}

export default ClientLayout;
