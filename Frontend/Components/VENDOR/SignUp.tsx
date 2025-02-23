"use client";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [loading, setLoading] = useState(false);

  const API_ENDPOINTS: Record<string, string> = {
    CUSTOMER: "https://ecoback.rablo.cloud/auth/signup",
    VENDOR: "https://ecoback.rablo.cloud/auth/signupVendor",
    KABADIWALA: "https://ecoback.rablo.cloud/auth/signupScrapCollector",
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS[role], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          name,
          phoneNo,
          currentLocation: { coordinates: [85.8302, 20.2970] }, // Hardcoded coordinates
        }),
      });

      const data = await response.json();
      console.log("Signup Response:", data);

      if (!response.ok) {
        throw new Error(data?.error || "Signup failed");
      }

      toast.success("Signup successful! check your mail");
    } catch (error: any) {
      toast.error(error.message || "Failed to connect to server");
      console.error("Signup Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
          Sign Up
        </h2>
        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Name
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Email (Username)
            </label>
            <input
              type="email"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="+11234567890"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Password
            </label>
            <input
              type="password"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Select Role
            </label>
            <select
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="VENDOR">Vendor</option>
              <option value="KABADIWALA">Kabadiwala</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg p-2"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </section>
  );
}
