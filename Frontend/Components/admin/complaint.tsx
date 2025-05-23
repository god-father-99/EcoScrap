"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as tmImage from '@teachablemachine/image';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import emailjs from 'emailjs-com';

interface PredictionResult {
  text: string;
  color: string;
}

interface LocationType {
  lat: number;
  lng: number;
}

const Report: React.FC = () => {
  const [model, setModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [maxPredictions, setMaxPredictions] = useState<number>(0);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [location, setLocation] = useState<LocationType | null>(null);
  const [address, setAddress] = useState<string>("");
  const [manualAddress, setManualAddress] = useState<string>("");
  const [cameraOn, setCameraOn] = useState<boolean>(false);
  const [formValid, setFormValid] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [userID, setUserID] = useState("");
  const URL = "/my_model/";
  const [pictureUrl, setPictureUrl] = useState(""); // Cloudinary image URL
  const [open, setOpen] = useState(false);
  const [imageData, setImageData] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);

  // Constants for API
  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/drivss6vy/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "images";
  const CLOUDINARY_API_KEY = "632818587151329";
  const API_ENDPOINT = "https://ecoback.rablo.cloud/complaint/register";

  useEffect(() => {
    // Get authentication token from local storage
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      router.push("/signin");
      return;
    }
    setToken(authToken);
    
    // Get user email from local storage or session if available
    const userEmail = localStorage.getItem("userEmail");
  

    const init = async () => {
      try {
        setLoading(true);
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        const loadedModel = await tmImage.load(modelURL, metadataURL);
        setModel(loadedModel);
        setMaxPredictions(loadedModel.getTotalClasses());
      } catch (err) {
        setError("Failed to load model. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const startCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((device) => device.kind === "videoinput");
   
        // Fallback to the first available camera if no back camera is found
        const backCameraDevice = videoDevices.find((device) => 
          device.label.toLowerCase().includes("back")
        ) || videoDevices[0]; // Fallback to the first available camera
   
        if (backCameraDevice) {
          navigator.mediaDevices
            .getUserMedia({ video: { deviceId: backCameraDevice.deviceId } })
            .then((stream) => {
              setCameraOn(true);
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
              }
            })
            .catch(() => setError("Unable to access the camera."));
        } else {
          setError("No camera device found.");
        }
      });
    } else {
      setError("Camera access is not supported by your browser.");
    }
  };

  if (open) {
    startCamera();
  }

  const captureImage = (e: any) => {
    e.preventDefault();
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 224, 224);
        const imageData = canvasRef.current.toDataURL('image/png');
        setImagePreviews((prev) => [...prev, imageData]);
        setImageData(imageData);
        setResults([]);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setLocation({ lat: latitude, lng: longitude });
              await getGeocodedAddress(latitude, longitude);
            },
            () => setError("Failed to access location.")
          );
        }
      }
    } else {
      setError("Video or Canvas element is not available.");
    }
  };

  const getGeocodedAddress = async (lat: number, lng: number) => {
    try {
      const apiKey = 'pk.68016a39b6df6a04a045a8e0fa1d55e6'; // LocationIQ API key
      const response = await axios.get(
        `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${lat}&lon=${lng}&format=json`
      );
      if (response.data) {
        setAddress(response.data.display_name);
      } else {
        setError("Failed to get the address.");
      }
    } catch {
      setError("Error fetching the address.");
    }
  };

  const validateImages = async () => {
    if (!model || imagePreviews.length < 2) {
      setError("Please capture at least two images.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const imageSize = 224;
      let allowedImageAccuracy = 0;

      for (let imagePreview of imagePreviews) {
        const imgElement = new Image();
        imgElement.src = imagePreview;

        await new Promise<void>((resolve) => {
          imgElement.onload = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = imageSize;
            canvas.height = imageSize;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(imgElement, 0, 0, imageSize, imageSize);

              const prediction = await model.predict(canvas);
              let highestProbability = 0;
              let predictedClass = '';

              for (let i = 0; i < maxPredictions; i++) {
                if (prediction[i].probability > highestProbability) {
                  highestProbability = prediction[i].probability;
                  predictedClass = prediction[i].className;
                }
              }

              if (predictedClass === "Garbage" || predictedClass === "Damaged Road") {
                allowedImageAccuracy += highestProbability * 100;
              }
            }

            resolve();
          };
        });
      }

      const combinedAccuracy = allowedImageAccuracy / imagePreviews.length;

      if (combinedAccuracy > 50) {
        setResults([{ text: "Allowed Image", color: "text-green-500" }]);
        setFormValid(true);
      } else {
        setResults([{ text: "Invalid Image", color: "text-red-500" }]);
        setFormValid(false);
      }
    } catch {
      setError("Error during validation.");
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToCloudinary = async () => {
    if (!imageData) {
      toast.error("⚠️ Please select an image to upload!");
      return null;
    }

    const formData = new FormData();
    formData.append("file", imageData);
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


  const handleSubmit = async () => {
    if (!formValid) {
      toast.error("Please validate the images before submitting");
      return;
    }

    if (!token) {
      toast.error("You need to be logged in to submit a complaint");
      router.push("/signin");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Processing your complaint...");
      

      // Upload image to Cloudinary and get URL
      const uploadedImageUrl = await uploadImageToCloudinary();
    if (!uploadedImageUrl) {
      return;
    }

    setPictureUrl(uploadedImageUrl);
      console.log(pictureUrl);
      // Use manual address if provided, otherwise use detected address
      const finalAddress = manualAddress || address;
      
      // Prepare complaint data
      const complaintData = {
        title: title,
        description: description,
        address: finalAddress,
        imageUrl: pictureUrl,
        //location: location ? `${location.lat},${location.lng}` : null
      };

      // Send complaint to API endpoint
      await axios.post(API_ENDPOINT, complaintData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Send confirmation email if email is available
      if (true) {
        const emailParams = {
          title: title,
          description: description,
          address: finalAddress,
          imageUrl:pictureUrl
        };

        await emailjs.send(
          'service_lc1og88',
          'template_fnywqha',
          emailParams,
          'uigmUE7Vm0-n3BXMz'
        );
      }

      toast.dismiss();
      toast.success("Complaint submitted successfully!");
      
      
      // Reset form after successful submission
      setTitle("");
      setDescription("");
      setImagePreviews([]);
      setImageData("");
      setManualAddress("");
      setFormValid(false);
      
      // Redirect to home page
      // router.push("/");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to submit complaint. Please try again.");
      console.error("Error submitting complaint:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-bold text-gray-900">Submit a Complaint</h2>
        <p className="text-center text-sm text-gray-500">Fill in the details and validate the images</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Complaint Title</label>
            <input
              type="text"
              placeholder="Complaint Title"
              className="w-full mt-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Complaint Description</label>
            <textarea
              placeholder="Complaint Description"
              className="w-full mt-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {cameraOn ? (
            <div>
              <video ref={videoRef} className="w-full h-40 rounded-lg mb-4" autoPlay playsInline muted />
              <canvas ref={canvasRef} width="224" height="224" className="hidden"></canvas>
              <button
                type="button"
                onClick={captureImage}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold focus:ring-2 focus:ring-blue-600"
              >
                Capture Photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(true);
              }}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold focus:ring-2 focus:ring-blue-600"
            >
              Start Camera
            </button>
          )}

          {imagePreviews.length > 0 && (
            <div className="space-y-2">
              <p className="text-gray-700">Images Preview</p>
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative">
                    <img src={src} alt={`Preview ${index + 1}`} className="h-24 w-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && <p className="text-gray-500">Validating...</p>}

          {results.length > 0 && (
            <p className={`text-lg font-bold ${results[0].color}`}>{results[0].text}</p>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="button"
            onClick={validateImages}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold focus:ring-2 focus:ring-green-600"
          >
            Validate Images
          </button>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Detected Location</label>
          {location ? (
            <p className="text-gray-500">{address}</p>
          ) : (
            <p className="text-gray-500">Location not available.</p>
          )}

          <label className="block mt-4 text-sm font-medium text-gray-700">Enter Address Manually</label>
          <input
            type="text"
            placeholder="Manual Address"
            className="w-full mt-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!formValid}
          className={`w-full mt-4 py-3 rounded-lg font-semibold focus:ring-2 ${
            formValid ? "bg-blue-500 text-white focus:ring-blue-600" : "bg-gray-300 text-gray-600"
          }`}
        >
          Submit Complaint
        </button>
        
      </div>
    </div>
  );
};

export default Report;
