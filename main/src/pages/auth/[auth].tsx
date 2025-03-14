import { useRouter } from "next/router";
import { useState, useEffect, useCallback, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { useUserContext } from "@/context/userContext";
import { z } from "zod";

interface ILoginUser {
  email: string;
  password: string;
}

interface IRegisterUser extends ILoginUser {
  name: string;
}

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function AuthPage() {
  const router = useRouter();
  const { auth } = router.query;
  const [formData, setFormData] = useState<ILoginUser | IRegisterUser>({ email: "", password: "" } as ILoginUser | IRegisterUser);
  const [isLogin, setIsLogin] = useState(auth !== "register");
  const [showPassword, setShowPassword] = useState(false);
  const { setIsLoggedIn, setUserData } = useUserContext();

  useEffect(() => {
    setIsLogin(auth !== "register");
    setShowPassword(false);
    setFormData({ email: "", password: "" } as ILoginUser | IRegisterUser);
  }, [auth]);

  const handleFormSubmit = useCallback(
    async (ev: FormEvent) => {
      ev.preventDefault();

      const validationResult = isLogin ? loginSchema.safeParse(formData) : registerSchema.safeParse(formData);
      if (!validationResult.success) {
        toast.error(validationResult.error.errors[0].message);
        return;
      }

      try {
        if (isLogin) {
          const response = await axios.post("/api/users/login", formData);
          toast.success("Login Successful");
          setUserData(response.data.data);
          setIsLoggedIn(true);
          router.push("/");
        } else {
          await axios.post("/api/users/register", formData);
          toast.success("Registered Successfully");
          router.push("/auth/login");
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data?.message || "Request failed");
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    },
    [formData, isLogin, router, setUserData, setIsLoggedIn]
  );

  return (
    <div className="py-12 flex items-center justify-center">
      <div className="bg-white p-8 shadow-lg rounded-md w-96 border border-gray-200">
        <h2 className="text-2xl font-semibold text-center mb-4">
          {isLogin ? "Login to Your Account" : "Create an Account"}
        </h2>

        <form className="space-y-4" onSubmit={handleFormSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border rounded-md border-gray-300"
              value={(formData as IRegisterUser).name || ""}
              onChange={(ev) =>
                setFormData((prev) => ({ ...prev, name: ev.target.value } as IRegisterUser))
              }
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-md border-gray-300"
            value={formData.email}
            onChange={(ev) =>
              setFormData((prev) => ({ ...prev, email: ev.target.value } as IRegisterUser | ILoginUser))
            }
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded-md border-gray-300 pr-10"
              value={formData.password}
              onChange={(ev) =>
                setFormData((prev) => ({ ...prev, password: ev.target.value } as IRegisterUser | ILoginUser))
              }
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button className=" cursor-pointer w-full p-3 bg-[#FF4F79] text-white rounded-md font-semibold">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          {isLogin ? "New here?" : "Already have an account?"} {" "}
          <span
            className="text-[#FF4F79] cursor-pointer"
            onClick={() => router.push(`/auth/${isLogin ? "register" : "login"}`)}
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
      <Toaster />
    </div>
  );
}