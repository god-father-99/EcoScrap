"use client"; // If using Next.js App Router

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Order {
  id: number;
  status: string;
  quantity: number;
  totalPrice: number;
  product: {
    imageUrl: string;
    name: string;
    description: string;
  };
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      toast.info("Fetching your orders...", { autoClose: 2000 });

      try {
        const token = localStorage.getItem("token"); // Get token from localStorage
        if (!token) {
          throw new Error("Authentication token is missing. Please log in.");
        }

        const response = await fetch("https://ecoback.rablo.cloud/orders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Attach Bearer token
          },
        });

        const result = await response.json();

        // Ensure result.data is an array before setting state
        if (Array.isArray(result.data)) {
          setOrders(result.data);
        } else {
          setOrders([]); // Fallback if data is not an array
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders.");
        setOrders([]); // Handle error by setting empty array
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-6">
      <ToastContainer /> {/* Notification System */}
      
      <h1 className="text-4xl font-extrabold mb-6 text-center tracking-wide">
        Your Orders
      </h1>

      {loading ? (
        <div className="text-center text-lg">Loading orders...</div>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-400">No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#1a1f2e] border border-gray-700 rounded-lg shadow-lg p-4 transition-transform transform hover:scale-105"
            >
              <img
                src={order.product.imageUrl}
                alt={order.product.name}
                className="w-full h-48 object-cover rounded-lg shadow-md"
              />
              <h2 className="text-xl font-semibold mt-3 text-white">
                {order.product.name}
              </h2>
              <p className="text-gray-300 mt-1">{order.product.description}</p>
              <p className="text-blue-400 font-medium mt-2">
                Quantity: {order.quantity}
              </p>
              <p className="text-green-400 font-medium mt-2">
                Total Price: {order.totalPrice}
              </p>
              <span
                className={`inline-block px-3 py-1 mt-3 text-sm font-semibold rounded-lg ${
                  order.status === "PENDING"
                    ? "bg-yellow-500 text-black"
                    : order.status === "PAYMENT_DONE"
                    ? "bg-green-500 text-black"
                    : "bg-red-500 text-black"
                }`}
              >
                {order.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
