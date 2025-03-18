"use client";
export const dynamic = "force-dynamic";
import { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (ev: FormEvent) => {
    ev.preventDefault();
    const validationResult = registerSchema.safeParse(formData);

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    try {
      await axios.post("/api/users/register", formData);
      toast.success("Registered Successfully");
      router.push("/login"); // ✅ Ensure the correct path
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
        <h2 className="text-2xl font-semibold text-center mb-4">Create an Account</h2>

        <form className="space-y-4" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-md border-gray-300"
            value={formData.name}
            onChange={(ev) => setFormData({ ...formData, name: ev.target.value })}
          />

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
            Register
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link href="/login">
            <span className="text-[#FF4F79] cursor-pointer">Login</span>
          </Link>
        </p>
      </div>
      <Toaster />
    </div>
  );
}