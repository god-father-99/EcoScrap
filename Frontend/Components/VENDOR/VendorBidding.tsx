"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
//import { useNavigate } from 'react-router-dom';

interface VendorBid {
  id: number; // Changed from vendorBidId to id
  title: string;
  description: string;
  basePrice: number;
  pictureUrl: string;
  auctionEndTime: string;
}

export default function VendorBidding() {
  const [bids, setBids] = useState<VendorBid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

   useEffect(() => {
       const storedToken = localStorage.getItem("token");
       setToken(storedToken);
   }, []);

  useEffect(() => {
    if (token) {
      fetchVendorBids();
    }
  }, [token]);

  const fetchVendorBids = async () => {
    if (!token) {
      toast.error("You are not logged in. Please log in first.");
      return;
    }

    try {
      const response = await fetch("https://ecoback.rablo.cloud/vendor-bids", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vendor bids");
      }

      const result = await response.json();
      const updatedBids = result.data.map((bid: VendorBid) => ({
        ...bid,
        bidEndTime: bid.auctionEndTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Default 1-hour timer
      }));
      setBids(updatedBids || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error fetching vendor bids");
      console.error("Vendor Bids Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 p-6">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Vendor Bidding Area
        </h1>

        {bids.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">No vendor bids available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bids.map((bid) => (
              <BidCard key={bid.id} bid={bid} token={token} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Separate Bid Card Component
const BidCard = ({ bid, token }: { bid: VendorBid; token: string | null }) => {
  //const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState<number | "">("");
  const [timeLeft, setTimeLeft] = useState<string>("");

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on input or button
    if (
      e.target instanceof HTMLElement && 
      (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || 
       e.target.closest('input') || e.target.closest('button'))
    ) {
      return;
    }
    
    window.location.href = `/mcd/community/${bid.id}`;
};

  useEffect(() => {
    const updateTimer = () => {
      const difference = new Date(bid.auctionEndTime).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [bid.auctionEndTime]);

  const handleBidAmountChange = (amount: string) => {
    const parsedAmount = parseFloat(amount);
    setBidAmount(isNaN(parsedAmount) ? "" : parsedAmount);
  };

  const handlePlaceBid = async () => {
    if (!token) {
      toast.error("You are not logged in. Please log in first.");
      return;
    }

    if (!bidAmount || bidAmount <= 0) {
      toast.error("Please enter a valid bid amount.");
      return;
    }

    if (!bid.id) {
      toast.error("Bid ID is missing. Cannot place bid.");
      console.error("Error: bid.id is undefined.");
      return;
    }

    try {
      const response = await fetch(`https://ecoback.rablo.cloud/vendor-bids/place/${bid.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bidAmount: bidAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place bid");
      }

      toast.success(`Bid placed successfully for ID: ${bid.id}`);
      setBidAmount(""); // Reset input after successful bid
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error placing bid");
      console.error("Bid Placement Error:", error);
    }
  };

  return (
    <div 
    onClick={handleCardClick}
    className="bg-white rounded-lg shadow-lg p-4 dark:bg-gray-800 cursor-pointer hover:shadow-xl transition-shadow"
  >
    <div key={bid.id} className="bg-white rounded-lg shadow-lg p-4 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{bid.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{bid.description}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Base Price: ₹{bid.basePrice}</p>

      {bid.pictureUrl && (
        <img src={bid.pictureUrl} alt="Scrap" className="mt-2 w-full h-40 object-cover rounded-md" />
      )}

      {/* Countdown Timer */}
      <p className="mt-2 text-sm font-semibold text-red-500">⏳ Time Left: {timeLeft}</p>
      {timeLeft === "00:00:00" && (
  <p className="mt-2 text-lg font-bold text-gray-500">⚠️ Bidding Over</p>
     )}

      {/* Input for placing bid */}
      <input
        type="number"
        className="mt-2 w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
        placeholder="Enter your bid"
        value={bidAmount}
        onChange={(e) => handleBidAmountChange(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white w-full mt-4 py-2 rounded-md hover:bg-blue-600 transition"
        onClick={handlePlaceBid}
      >
        💰 Place Bid
      </button>
    </div>
  </div>
  );
};
