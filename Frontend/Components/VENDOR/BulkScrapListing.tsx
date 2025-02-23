"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";


interface BidDetail {
   id: number;
   vendor: {
       user: {
           name: string;
           username: string;
       }
   };
   bidAmount: number;
   isAccepted: boolean;
}

const BulkScrapListing = () => {
   const { id } = useParams() as { id: string }; // Using react-router-dom's useParams
   const [bids, setBids] = useState<BidDetail[]>([]);
   const [loading, setLoading] = useState(true);
   const [token, setToken] = useState<string | null>(null);

   useEffect(() => {
       const storedToken = localStorage.getItem("token");
       setToken(storedToken);
   }, []);

   useEffect(() => {
       if (token && id) {
           fetchBidDetails();
       }
   }, [token, id]);

   const fetchBidDetails = async () => {
       try {
           const response = await fetch(`https://ecoback.rablo.cloud/vendor-bids/bulk-listing/${id}`, {
               headers: {
                   "Content-Type": "application/json",
                   Authorization: `Bearer ${token}`,
               },
           });

           if (!response.ok) {
               throw new Error("Failed to fetch bid details");
           }

           const result = await response.json();
           setBids(result.data);
           setLoading(false);
       } catch (error) {
           toast.error(error instanceof Error ? error.message : "Error fetching bid details");
           setLoading(false);
       }
   };

   if (loading) {
       return (
           <div className="flex justify-center items-center min-h-screen">
               <div className="text-2xl font-semibold">Loading...</div>
           </div>
       );
   }

   if (bids.length === 0) {
       return (
           <div className="container mx-auto p-6">
               <h2 className="text-2xl font-bold mb-6">Bulk Scrap Listing Bids</h2>
               <div className="text-center text-gray-600">
                   No bids available for this listing
               </div>
           </div>
       );
   }

   return (
       <div className="container mx-auto p-6">
           <h2 className="text-2xl font-bold mb-6">Bulk Scrap Listing Bids</h2>
           <div className="grid gap-4">
               {bids.map((bid) => (
                   <div
                       key={bid.id}
                       className={`p-4 rounded-lg shadow-md ${
                           bid.isAccepted 
                               ? 'bg-green-50 border-2 border-green-500' 
                               : 'bg-red-50 border-2 border-red-500'
                       }`}
                   >
                       <div className="flex justify-between items-center">
                           <div className="space-y-2">
                               <p className="text-lg font-semibold">
                                   {bid.vendor.user.name}
                               </p>
                               <p className="text-gray-600">
                                   {bid.vendor.user.username}
                               </p>
                               <p className="text-xl font-bold">
                                   ₹{bid.bidAmount.toLocaleString('en-IN')}
                               </p>
                           </div>
                           <div>
                               <span 
                                   className={`px-4 py-2 rounded-full ${
                                       bid.isAccepted 
                                           ? 'bg-green-200 text-green-800' 
                                           : 'bg-red-200 text-red-800'
                                   } font-semibold`}
                               >
                                   {bid.isAccepted ? 'Highest Bid' : 'Pending'}
                               </span>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
       </div>
   );
};

export default BulkScrapListing;