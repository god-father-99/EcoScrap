"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function SendBidRequest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [pictureUrl, setPictureUrl] = useState(""); // Cloudinary image URL
  const [imageFile, setImageFile] = useState<File | null>(null); // Image file
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  // Handle Image Selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  // Upload Image to Cloudinary
  const uploadImageToCloudinary = async () => {
    if (!imageFile) {
      toast.error("⚠️ Please select an image to upload!");
      return null;
    }

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "images"); // Use your Cloudinary upload preset

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/drivss6vy/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to upload image");
      }

      return data.secure_url; // Return uploaded image URL
    } catch (error: any) {
      toast.error(error.message || "Error uploading image");
      return null;
    }
  };

  // Handle Bid Request Submission
  const handleSendBid = async () => {
    if (!token) {
      toast.error("❌ Access denied! Please log in.");
      return;
    }

    if (!title || !description || !basePrice || !imageFile) {
      toast.error("⚠️ Please fill in all fields!");
      return;
    }

    toast.info("📤 Uploading image...");

    const uploadedImageUrl = await uploadImageToCloudinary();
    if (!uploadedImageUrl) {
      return;
    }

    setPictureUrl(uploadedImageUrl);

    const bidData = {
      title,
      description,
      basePrice: parseFloat(basePrice),
      pictureUrl: uploadedImageUrl, // Use the uploaded image URL
    };

    try {
      const response = await fetch("https://ecoback.rablo.cloud/bulk-listings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bidData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send bid request");
      }

      toast.success("✅ Bid request sent successfully!");
      setTitle("");
      setDescription("");
      setBasePrice("");
      setPictureUrl("");
      setImageFile(null);
    } catch (error: any) {
      toast.error(error.message || "Error sending bid request");
      console.error("Error:", error);
    }
  };

  return (
    <section 
      className="flex justify-center items-center min-h-screen bg-cover bg-center relative" 
      style={{ backgroundImage: "url('/assets/scrap-theme.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div> 

      <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-xl border-2 border-green-500 w-full max-w-md transform transition duration-300 hover:scale-105">
        <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">♻️ Send Bid Request</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400 resize-none h-24"
          ></textarea>

          <input
            type="number"
            placeholder="Base Price"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400"
          />

          {/* Image Upload Input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400"
          />

          {/* Show Image Preview */}
          {imageFile && (
            <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-40 object-cover rounded-md mt-2" />
          )}

          <button
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-300 transform hover:scale-105"
            onClick={handleSendBid}
          >
            📩 Send Bid
          </button>
        </div>
      </div>
    </section>
  );
}
