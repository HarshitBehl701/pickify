import AdminDashboardLayout from "@/components/layouts/adminDashboardLayout/adminDashboardLayout";
import { UserContextProvider } from "@/context/userContext";
import { IUser } from "@/migrations/Migration";
import "@/styles/globals.css";
import axios from "axios";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  const [userData,setUserData] =  useState<IUser|null>(null);
  const [isLoggedIn,setIsLoggedIn] =  useState<boolean|null>(null);

  useEffect(() =>{
    if(isLoggedIn  == null)
    {
        ;(async () => {
            try {
                const response = await axios.post("/api/admin/login_details",{},{withCredentials:true});
                setIsLoggedIn(true);
                setUserData(response.data.data);
              } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    setIsLoggedIn(false)
                } else {
                    setIsLoggedIn(false)
                }
              }  
        })()
    }
},[isLoggedIn]);

  return (
    <UserContextProvider userData={userData}  setUserData={setUserData} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
      {
        !isLoggedIn ? (
          <>
          <Toaster  />  
          <Component {...pageProps} />
          </>
        ) : (
          <AdminDashboardLayout>
            <Toaster  />
            <Component {...pageProps} />
          </AdminDashboardLayout>
        )
      }
    </UserContextProvider>
  );
}
