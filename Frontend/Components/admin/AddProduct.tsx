"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(""); // Cloudinary Image URL
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    console.log("Retrieved Token:", storedToken); // Debugging
    setToken(storedToken);
  }, []);

  // 🔹 Handle Image Upload to Cloudinary
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImage(file);
    toast.info("Uploading image, please wait...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "images"); // Your Cloudinary upload preset

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/drivss6vy/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        toast.success("✅ Image uploaded successfully!");
      } else {
        throw new Error("Image upload failed!");
      }
    } catch (error) {
      toast.error("❌ Failed to upload image!");
      console.error("Cloudinary Upload Error:", error);
    }
  };

  // 🔹 Handle Product Submission
  const handleAddProduct = async () => {
    if (!token) {
      toast.error("❌ Access denied! Please log in.");
      console.log("Token is missing!");
      return;
    }

    if (!name || !description || !price || !imageUrl || !quantity) {
      toast.error("⚠️ Please fill in all fields!");
      return;
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
      imageUrl, // Cloudinary URL
    };

    try {
      const response = await fetch("https://ecoback.rablo.cloud/products/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ensure token is passed correctly
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add product");
      }

      toast.success("✅ Product added successfully!");
      setName("");
      setDescription("");
      setPrice("");
      setQuantity("");
      setImageUrl("");
    } catch (error: any) {
      toast.error(error.message || "Error adding product");
      console.error("API Error:", error);
    }
  };

  return (
    <section
      className="flex justify-center items-center min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/assets/scrap-theme.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-xl border-2 border-green-500 w-full max-w-md transform transition duration-300 hover:scale-105">
        <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">🛒 Add Product</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            placeholder="Price (₹)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400"
          />

          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400"
          />

          {/* Image Upload Input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400"
          />

          {/* Show Image Preview */}
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-md mt-2" />
          )}

          <button
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-300 transform hover:scale-105"
            onClick={handleAddProduct}
          >
            ➕ Add Product
          </button>
        </div>
      </div>
    </section>
  );
}
