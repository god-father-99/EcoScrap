"use client"
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CommunityPage = () => {
  const [marketPrices, setMarketPrices] = useState<
    { item: string; price: string; image: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [displayedImages, setDisplayedImages] = useState<
    { item: string; price: string; image: string }[]
  >([]);

  useEffect(() => {
    toast.info("Fetching latest market prices...");
    setTimeout(() => {
      const items = [
        { item: "Copper", price: "₹700/kg", image: "https://tse3.mm.bing.net/th?id=OIP.yqASihy51o6X2eJMwLfU0gHaE8&pid=Api&P=0&h=180" },
        { item: "Aluminum", price: "₹200/kg", image: "https://tse2.mm.bing.net/th?id=OIP.P0Od4dAUug2oh-f6jfe6OgHaDr&pid=Api&P=0&h=180" },
        { item: "Plastic", price: "₹40/kg", image: "https://tse2.mm.bing.net/th?id=OIP.7LcWq6L8gh_4IrxwWtl0VQHaEO&pid=Api&P=0&h=180" },
        { item: "Iron", price: "₹50/kg", image: "https://tse2.mm.bing.net/th?id=OIP.wN7NO4WrharJIgtvykYPmQHaE7&pid=Api&P=0&h=180" },
        { item: "Paper", price: "₹10/kg", image: "https://tse3.mm.bing.net/th?id=OIP.-hESzqTJWLDhG3eBq0sDoQHaHa&pid=Api&P=0&h=180" },
        { item: "Brass", price: "₹550/kg", image: "https://tse1.mm.bing.net/th?id=OIP.7EkiRnuk6EzDqyvt8AH1CAHaEK&pid=Api&P=0&h=180" },
        { item: "Steel", price: "₹100/kg", image: "https://steelfabservices.com.au/wp-content/uploads/2020/12/F-1.jpg" },
        { item: "Glass", price: "₹20/kg", image: "https://tse3.mm.bing.net/th?id=OIP.6FusDreFyU7eAl3LKELAfQHaJ8&pid=Api&P=0&h=180" },
        { item: "E-waste", price: "₹800/kg", image: "https://tse2.mm.bing.net/th?id=OIP.0wBhvt_fb80qyv8HRHEccAHaEc&pid=Api&P=0&h=180" },
        { item: "Battery Scrap", price: "₹300/kg", image: "https://tse2.mm.bing.net/th?id=OIP.fxdbRoroIyA3bvmrY3OQggHaHa&pid=Api&P=0&h=180" },
      ];
      setMarketPrices(items);
      setLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    if (marketPrices.length > 0) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < marketPrices.length) {
          setDisplayedImages((prev) => [...prev, marketPrices[index]]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [marketPrices]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <ToastContainer />
      <h1 className="text-5xl font-extrabold text-center mb-8 text-white animate-fade-in shadow-lg p-4 bg-gray-800 rounded-lg">
        Community Scrap Market
      </h1>
      <div className="bg-gray-900 shadow-2xl p-6 rounded-xl border border-gray-700 hover:shadow-2xl transition duration-300 transform hover:scale-105 w-full max-w-5xl">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">Current Market Prices</h2>
        {loading ? (
          <p className="text-center text-gray-300 animate-pulse">Fetching latest prices...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {displayedImages.length > 0 ? (
              displayedImages.map((item, index) =>
                item ? (
                  <div
                    key={index}
                    className="border p-4 rounded-lg shadow-lg hover:shadow-xl transition bg-gray-800 transform hover:scale-105 opacity-100 animate-fade-in"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.item}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-700 flex items-center justify-center rounded-lg">
                        <span className="text-gray-400">No Image Available</span>
                      </div>
                    )}
                    <p className="text-lg font-semibold mt-2 text-white">{item.item || "Unknown"}</p>
                    <p className="text-white text-lg">{item.price || "N/A"}</p>
                  </div>
                ) : null
              )
            ) : (
              <p className="text-gray-400 text-center">No items to display.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;