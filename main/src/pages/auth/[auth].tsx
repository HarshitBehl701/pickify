import { useRouter } from "next/router";
import { useState, useEffect, useCallback, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

interface ILoginUser{
  email:string;
  password:string
}

interface IRegisterUser extends  ILoginUser{
  name:string
}

export default function AuthPage() {
  const router = useRouter();
  const { auth } = router.query;
  const [formData,setFormData] = useState<ILoginUser|IRegisterUser|null>(null);

  const [isLogin, setIsLogin] = useState(auth === "register" ? false : true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsLogin(auth === "register" ? false : true);
    setShowPassword(false);
    setFormData(null);
  }, [auth]);

  const handleFormSubmit = useCallback((ev:FormEvent) =>  {
    ev.preventDefault();
    if(formData)
    {

    }
  },[formData]);

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
              value={(formData as IRegisterUser)?.name}
              onChange={(ev) =>  setFormData(prev  => ({...prev,name:ev.target.value}   as IRegisterUser))}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-md border-gray-300"
            value={formData?.email}
            onChange={(ev) =>  setFormData(prev  => ({...prev,email:ev.target.value}   as IRegisterUser | ILoginUser))}
          />

          {/* Password Input with Toggler */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded-md border-gray-300 pr-10"
              value={formData?.password}
              onChange={(ev) =>  setFormData(prev  => ({...prev,password:ev.target.value}   as IRegisterUser | ILoginUser))}
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
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <span
            className="text-[#FF4F79] cursor-pointer"
            onClick={() =>
              router.push(`/auth/${isLogin ? "register" : "login"}`)
            }
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}