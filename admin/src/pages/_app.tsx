import AdminDashboardLayout from "@/components/layouts/adminDashboardLayout/adminDashboardLayout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLoginRoute = router.pathname === "/";
  return isLoginRoute ? (
    <Component {...pageProps} />
  ) : (
    <AdminDashboardLayout>
      <Component {...pageProps} />
    </AdminDashboardLayout>
  );
}
