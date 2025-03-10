import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

interface ILoginUser {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<ILoginUser>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleFormSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    console.log("Logging in with: ", formData);
    // Add login logic here
  };

  return (
    <div className="py-12 h-screen flex items-center justify-center">
      <div className="bg-white p-8 shadow-lg rounded-md w-96 border border-gray-200">
          <div className="header mb-4 flex flex-col items-center ">
          <div className="relative w-32 h-24 rounded-md overflow-hidden">
          <Image
            src={'/assets/mainAssets/logos/logo.png'}
            alt="product"
            layout="fill"
            objectFit="cover"
          />
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

          {/* Password Input with Toggler */}
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
      </div>
    </div>
  );
}