"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Signin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);  // Add a loading state
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setUserRole(storedRole);
      if (storedRole === "VENDOR") {
        router.push("/mcd/profile");
      } else if (storedRole === "CUSTOMER") {
        router.push("/mcd/profile");
      }
      else if(storedRole=="KABADIWALA"){
        router.push("/admin/profile")
      }
    }
    setLoading(false);  // Stop loading after the check
  }, []); // Run only once when the component mounts

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("https://ecoback.rablo.cloud/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        mode: "cors",
        credentials: "include",
      });

      const data = await response.json();
      console.log("Login Response:", data);

      if (!response.ok) {
        throw new Error(data?.error || "Login failed");
      }

      if (data.data?.accessToken && data.data?.refreshToken) {
        localStorage.setItem("token", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        
        const role = data.data?.roles[0]; // Get the first role from the roles array
        setUserRole(role);
        localStorage.setItem("userRole", role); // Store role in localStorage
        
        toast.success("Signin Successful");

        // Redirecting after setting the role
        if (role === "CUSTOMER") {
          router.push("/ngo/profile");
        } else if (role === "VENDOR") {
          router.push("/mcd/profile");
        }
        else if(role=="KABADIWALA"){
          router.push("/admin/profile")
        }
      } else {
        throw new Error("Tokens not received");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to connect to server");
      console.error("Signin Error:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;  // Show loading while checking for the role
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSignin}>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Your username
                </label>
                <input
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Sign In
              </button>
            </form>
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
