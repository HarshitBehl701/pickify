"use client";
export const dynamic = "force-dynamic";

import { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { useUserContext } from "@/context/userContext";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function Login() {
  const router = useRouter();
  const { setIsLoggedIn, setUserData } = useUserContext();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (ev: FormEvent) => {
    ev.preventDefault();
    const validationResult = loginSchema.safeParse(formData);

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    try {
      const response = await axios.post("/api/users/login", formData);
      toast.success("Login Successful");
      setUserData(response.data.data.userData);
      setIsLoggedIn(true);

      if (typeof window !== "undefined") {
        router.push("/");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "Request failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="py-12 flex items-center justify-center">
      <div className="bg-white p-8 shadow-lg rounded-md w-96 border border-gray-200">
        <h2 className="text-2xl font-semibold text-center mb-4">Login to Your Account</h2>

        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-md border-gray-300"
            value={formData.email}
            onChange={(ev) => setFormData({ ...formData, email: ev.target.value })}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded-md border-gray-300 pr-10"
              value={formData.password}
              onChange={(ev) => setFormData({ ...formData, password: ev.target.value })}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button className="w-full p-3 bg-[#FF4F79] text-white rounded-md font-semibold">
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          New here?{" "}
          <Link href="/register">
            <span className="text-[#FF4F79] cursor-pointer">Register</span>
          </Link>
        </p>
      </div>
      <Toaster />
    </div>
  );
}
