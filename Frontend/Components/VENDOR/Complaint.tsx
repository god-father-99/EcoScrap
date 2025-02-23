"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import emailjs from "emailjs-com";

const ComplaintForm: React.FC = () => {
  const [title, setTitle] = useState("");
  
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("Jagamara, Bhubaneswar");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<tmImage.CustomMobileNet | null>(null);

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/drivss6vy/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "images";
  const API_KEY = "632818587151329";

  // useEffect(() => {
  //   const loadModel = async () => {
  //     const modelURL = "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_URL/model.json";
  //     const metadataURL = "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_URL/metadata.json";
  //     const loadedModel = await tmImage.load(modelURL, metadataURL);
  //     setModel(loadedModel);
  //   };
  //   loadModel();
  // }, []);

  // useEffect(() => {
  //   if ("geolocation" in navigator) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         setAddress(`Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
  //       },
  //       () => {
  //         toast.error("Got Location ...");
  //       }
  //     );
  //   }
  // }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      toast.error("Please select an image first!");
      return;
    }
    setLoading(true);
    toast.loading("Uploading image...");

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("api_key", API_KEY);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData);
      setImageUrl(response.data.secure_url);
      toast.dismiss();
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  const sendEmailNotification = async (complaintData: any) => {
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          title: complaintData.title,
          description: complaintData.description,
          address: complaintData.address,
          imageUrl: complaintData.imageUrl,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      toast.success("Email notification sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email notification.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated. Please log in.");
      return;
    }
    if (!title || !description || !address || !imageUrl) {
      toast.error("Please fill all fields and upload an image.");
      return;
    }
    setLoading(true);
    toast.loading("Submitting complaint...");
    
    const complaintData = { title, description, address, imageUrl };
    try {
      await axios.post("https://ecoback.rablo.cloud/complaint/register", complaintData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Send Email Notification after successful complaint registration
      await sendEmailNotification(complaintData);

      toast.dismiss();
      toast.success("Complaint registered successfully!");
      setTitle("");
      setDescription("");
      setImageUrl("");
      setPreviewUrl("");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error submitting complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-green-500 p-6">
      <div className="max-w-lg w-full bg-white shadow-2xl rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">📢 Submit a Complaint</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          ></textarea>
          <input
            type="text"
            value={address}
            disabled
            className="w-full p-3 border rounded-lg bg-gray-100 text-gray-600"
          />
          <div className="space-y-2">
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg mt-2" />
            )}
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              {loading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-all"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default ComplaintForm;