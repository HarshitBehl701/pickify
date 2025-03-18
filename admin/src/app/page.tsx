"use client"
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { useUserContext } from "@/context/userContext";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const  {setIsLoggedIn,isLoggedIn,setUserData} = useUserContext();

  useEffect(() => {
    if(isLoggedIn) router.push('/admin/profile');
  },[isLoggedIn,router])
  
  const handleFormSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    
    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post("/api/admin/login", formData);
      toast.success("Login successful!");
      setIsLoggedIn(true);
      setUserData(response.data.data.userData);
      router.push("/admin/profile");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "Login failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }    
  };

  return (
    <div className="py-12 h-screen flex items-center justify-center">
      <div className="bg-white p-8 shadow-lg rounded-md w-96 border border-gray-200">
        <div className="header mb-4 flex flex-col items-center">
          <div className="relative w-32 h-24 rounded-md overflow-hidden">
            <Image src={'/assets/mainAssets/logos/logo.png'} alt="product"  fill={true} objectFit="cover" />
          </div>
          <h2 className="text-2xl font-semibold text-center">Admin</h2>
        </div>
        
        <form className="space-y-4" onSubmit={handleFormSubmit}>
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
          
          <button
            className="w-full p-3 bg-[#FF4F79] text-white rounded-md font-semibold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}