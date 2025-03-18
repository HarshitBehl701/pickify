'use client';
import AdminLayout from "@/components/layouts/AdminLayout";
import { UserContextProvider } from "@/context/userContext";
import { IUser } from "@/migrations/Migration";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";

function ClientLayout({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<IUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoggedIn == null) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/admin/login_details",
            {},
            { withCredentials: true }
          );
          setIsLoggedIn(true);
          setUserData(response.data.data);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            setIsLoggedIn(false);
          } else {
            setIsLoggedIn(false);
          }
        }
      })();
    }
  }, [isLoggedIn]);

  return (
    <UserContextProvider
      userData={userData}
      setUserData={setUserData}
      isLoggedIn={isLoggedIn}
      setIsLoggedIn={setIsLoggedIn}
    >
      <Toaster />
      {isLoggedIn ? <AdminLayout>{children}</AdminLayout> : <>{children}</>}
    </UserContextProvider>
  );
}

export default ClientLayout;
