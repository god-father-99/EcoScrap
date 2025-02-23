"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Razorpay from "razorpay";

interface Product {
  id: number;
  name: string | null;
  description: string | null;
  price: number;
  quantity: number;
  imageUrl: string | null;
  status: string;
}

export default function AllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Missing authentication token. Please log in.");
      }

      const response = await fetch("https://ecoback.rablo.cloud/products/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.data || !Array.isArray(result.data)) {
        setError("Invalid data format received.");
        return;
      }

      setProducts(result.data);

      const initialQuantities: { [key: number]: number } = {};
      result.data.forEach((product: Product) => {
        initialQuantities[product.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error: any) {
      setError(error.message || "Failed to fetch products");
      toast.error(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (productId: number, quantity: number) => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        throw new Error("Authentication token is missing. Please log in.");
      }
  
      const response = await fetch(
        `https://ecoback.rablo.cloud/orders/place?productId=${productId}&quantity=${quantity}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.data?.error === "Insufficient stock") {
          throw new Error("Not enough stock available for this order.");
        }
        throw new Error(`Order failed: ${response.status}`);
      }
  
      const result = await response.json();
  
      // Load Razorpay script dynamically if not already loaded
      const loadRazorpay = () =>
        new Promise((resolve) => {
          if (document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']")) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => resolve(true);
          document.body.appendChild(script);
        });
  
      await loadRazorpay();
  
      // Razorpay options
      const options = {
        key: "rzp_test_Do9H20aL0GBIAC",
        amount: result.data.totalPrice * 100,
        currency: "INR",
        name: result.data.customer.user.name,
        description: "Order Payment",
        order_id: result.data.razorpayOrderId,
        receipt: result.data.customer.user.username,
        handler: async function (response: any) {
          try {
            // Convert response object to URL search params
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(response)) {
              params.append(key, value as string);
            }

            // Make API call with query parameters
            const result = await fetch(
              `https://ecoback.rablo.cloud/orders/paymentCallback?${params.toString()}`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );

            if (!result.ok) {
              throw new Error('Payment verification failed');
            }

            toast.success("Payment successful!");
            // Add any additional logic after successful payment
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: result.data.customer.user.name,
          email: result.data.customer.user.username,
        },
        theme: {
          color: "#339900",
        },
      };
  
      // Ensure window.Razorpay is available before calling it
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const rzp1 = new (window as any).Razorpay(options);
        rzp1.open();
      } else {
        throw new Error("Razorpay SDK failed to load. Please refresh and try again.");
      }
  
      fetchProducts();
    } catch (error: any) {
      toast.error(`❌ ${error.message}`);
    }
  };
  const handleOrder1 = async (productId: number, quantity: number) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token is missing. Please log in.");
      }

      const response = await fetch(
        `https://ecoback.rablo.cloud/orders/place1?productId=${productId}&quantity=${quantity}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.data?.error === "Insufficient stock") {
          throw new Error("Not enough stock available for this order.");
        }
        throw new Error(`Order failed: ${response.status}`);
      }

      toast.success("✅ Order placed successfully!");
      fetchProducts();
    } catch (error: any) {
      toast.error(`❌ ${error.message}`);
    }
  };
  

  if (loading) {
    return <div className="text-center py-6 text-lg">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-500">
        ❌ {error}
        <button
          onClick={fetchProducts}
          className="block mx-auto mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <section className="bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          🛒 Available Products
        </h1>

        {products.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            ❗ No products available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              let imageUrl = product.imageUrl;

              // Ensure image URL is properly handled
              if (imageUrl) {
                if (!imageUrl.startsWith("http") && !imageUrl.startsWith("blob:")) {
                  imageUrl = `https://ecoback.rablo.cloud${imageUrl}`;
                }
              }

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
                >
                  <img
                    src={imageUrl || "https://via.placeholder.com/150?text=No+Image"}
                    alt={product.name || "No Name"}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {product.name || "Unnamed Product"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {product.description || "No description available"}
                    </p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-2">
                      ₹{product.price}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      Stock: {Number(product.quantity) || 0}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [product.id]: Math.max(1, prev[product.id] - 1),
                          }))
                        }
                        disabled={quantities[product.id] <= 1}
                        className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded-lg"
                      >
                        ➖
                      </button>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white mx-3">
                        {quantities[product.id]}
                      </span>
                      <button
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [product.id]: prev[product.id] + 1,
                          }))
                        }
                        disabled={quantities[product.id] >= product.quantity}
                        className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded-lg"
                      >
                        ➕
                      </button>
                    </div>

                    <button
                      onClick={() => handleOrder(product.id, quantities[product.id])}
                      className="bg-blue-500 text-white w-full mt-4 py-2 rounded-md hover:bg-blue-600 transition"
                      disabled={quantities[product.id] > product.quantity}
                    >
                      ✅ Confirm Order (Pay Online)
                    </button>
                    <button
                      onClick={() => handleOrder1(product.id, quantities[product.id])}
                      className="bg-blue-500 text-white w-full mt-4 py-2 rounded-md hover:bg-blue-600 transition"
                      disabled={quantities[product.id] > product.quantity}
                    >
                      ✅ Confirm Order COD
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
