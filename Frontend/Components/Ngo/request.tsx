"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const CLOUDINARY_API_KEY = "632818587151329";
const CLOUDINARY_UPLOAD_PRESET = "images";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/drivss6vy/image/upload";

export default function RequestPickup() {
  const [pickupLocation, setPickupLocation] = useState({ coordinates: [85.8302, 20.2970] });
  const [address, setAddress] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("api_key", CLOUDINARY_API_KEY);

    toast.info("Uploading Image...");

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Upload failed");

      toast.success("Image Uploaded Successfully!");
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Image upload failed");
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = await uploadImageToCloudinary(file);
      if (imageUrl) setPictureUrl(imageUrl);
    }
  };

  const handleRequestPickup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    let accessToken = localStorage.getItem("token");

    if (!accessToken) {
      toast.error("You must be logged in.");
      router.push("/signin");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("https://ecoback.rablo.cloud/customer/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ pickupLocation, address, mobileNo, pictureUrl, description }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Request failed.");

      toast.success("Pickup request successful!");
    } catch (error) {
      toast.error("An error occurred.");
    }
    setIsLoading(false);
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-[#0a192f] p-6">
      <motion.div 
        className="max-w-lg w-full bg-white/10 backdrop-blur-xl dark:bg-gray-800/60 rounded-2xl shadow-2xl p-8 border border-gray-500"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white text-center">Request Pickup</h1>
        <form className="space-y-6 mt-6" onSubmit={handleRequestPickup}>
          {/* Address Input */}
          <div>
            <label className="block text-sm font-medium text-white">Address</label>
            <input
              type="text"
              className="w-full mt-2 p-3 border rounded-lg bg-white/20 text-white placeholder-white/70"
              placeholder="Enter your pickup address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-white">Mobile No</label>
            <input
              type="text"
              className="w-full mt-2 p-3 border rounded-lg bg-white/20 text-white placeholder-white/70"
              placeholder="Enter your mobile number"
              required
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-white">Upload Image</label>
            <input type="file" accept="image/*" className="w-full mt-2 p-2 bg-white/20 text-white" onChange={handleFileChange} />
            {pictureUrl && (
              <div className="mt-4">
                <img src={pictureUrl} alt="Uploaded" className="w-full h-auto rounded-lg border border-gray-300 shadow-lg" />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white">Description</label>
            <textarea
              className="w-full mt-2 p-3 border rounded-lg bg-white/20 text-white placeholder-white/70"
              placeholder="Describe your scrap materials"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className={`w-full text-white bg-gradient-to-r from-green-500 to-teal-500 hover:scale-105 font-medium rounded-lg text-lg px-5 py-3 transition-all duration-300 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
          >
            {isLoading ? "Requesting..." : "Request Pickup"}
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
}
