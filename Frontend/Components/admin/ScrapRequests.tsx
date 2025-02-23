"use client"; // Ensure this is a Client Component

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface ScrapItem {
  pickupId: number;
  description: string;
  requestedTime: string;
  pickupLocation: {
    coordinates: [number, number];
  };
  mobileNo: string;
  pictureUrl: string;
  seller: {
    user: {
      name: string;
    };
    rating: number;
  };
  scrapPickupRequestStatus: string;
  address: string;
}

export default function ScrapRequests() {
  const [scrapData, setScrapData] = useState<ScrapItem[]>([]);
  const [acceptedScrapData, setAcceptedScrapData] = useState<ScrapItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

   useEffect(() => {
       const storedToken = localStorage.getItem("token");
       setToken(storedToken);
   }, []);

  useEffect(() => {
    if (token) {
      fetchScrapData();
    }
  }, [token]);

  const fetchScrapData = async () => {
    if (!token) {
        toast.error("You are not logged in. Please log in first.");
        return;
    }

    try {
        const response = await fetch("https://ecoback.rablo.cloud/scrap", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch scrap data");
        }

        const result = await response.json();
        const allScrapData = result.data || [];

        // Filter data into pending and accepted requests
        const pendingRequests: ScrapItem[] = allScrapData.filter((item: ScrapItem) => item.scrapPickupRequestStatus !== "CONFIRMED");
        const acceptedRequests: ScrapItem[] = allScrapData.filter((item: ScrapItem) => item.scrapPickupRequestStatus === "CONFIRMED");

        setScrapData(pendingRequests);
        setAcceptedScrapData(acceptedRequests);
    } catch (error: any) {
        toast.error(error.message || "Error fetching scrap data");
        console.error("Scrap List Error:", error);
    } finally {
        setLoading(false);
    }
};


  const handleAcceptPickup = async (pickupId: number) => {
    if (!token) {
        toast.error("You are not logged in. Please log in first.");
        return;
    }

    try {
        const response = await fetch(`https://ecoback.rablo.cloud/scrap/acceptPickup/${pickupId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to accept pickup request");
        }

        toast.success(`Pickup request accepted for ID: ${pickupId}`);

        // Update the scrap request status
        setScrapData((prevData) => {
            return prevData.map((item) => {
                if (item.pickupId === pickupId) {
                    return { ...item, scrapPickupRequestStatus: "CONFIRMED" };
                }
                return item;
            });
        });

        // Move the confirmed item to "Accepted Requests"
        setTimeout(() => {
            setScrapData((prevData) => prevData.filter((item) => item.pickupId !== pickupId));
            setAcceptedScrapData((prevAccepted) => {
                const acceptedItem = scrapData.find((item) => item.pickupId === pickupId);
                return acceptedItem ? [...prevAccepted, acceptedItem] : prevAccepted;
            });
        }, 500); // Add a slight delay to reflect the change smoothly

    } catch (error: any) {
        toast.error(error.message || "Error accepting pickup request");
        console.error("Accept Pickup Error:", error);
    }
};


  const handleCreateBid = async () => {
    if (!token) {
      toast.error("You are not logged in. Please log in first.");
      return;
    }

    const bidData = {
      title: "hello1",
      description: "this is a bulk scrap list1",
      basePrice: 23400.6,
      pictureUrl: "alsdhasdh/kasdfsdhj.png",
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
        throw new Error("Failed to create bid");
      }

      toast.success("Bid successfully created!");
    } catch (error: any) {
      toast.error(error.message || "Error creating bid");
      console.error("Create Bid Error:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 p-6">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Scrap Requests
        </h1>

        {/* Pending Scrap Requests */}
        {scrapData.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">No pending scrap requests available.</p>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pending Requests</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {scrapData.map((scrap) => (
                <div key={scrap.pickupId} className="bg-white rounded-lg shadow-lg p-4 dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pickup ID: {scrap.pickupId}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{scrap.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address: {scrap.address}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">📞 {scrap.mobileNo}</p>

                  {scrap.pictureUrl && (
                    <img src={scrap.pictureUrl} alt="Scrap" className="mt-2 w-full h-40 object-cover rounded-md" />
                  )}

                  <button
                    className="bg-green-500 text-white w-full mt-4 py-2 rounded-md hover:bg-green-600 transition"
                    onClick={() => handleAcceptPickup(scrap.pickupId)}
                  >
                    ✅ Accept Pickup
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Scrap Requests */}
        {acceptedScrapData.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Accepted Requests</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {acceptedScrapData.map((scrap) => (
                <div key={scrap.pickupId} className="bg-gray-200 rounded-lg shadow-lg p-4 dark:bg-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pickup ID: {scrap.pickupId}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{scrap.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Address: {scrap.address}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">📞 {scrap.mobileNo}</p>

                  {scrap.pictureUrl && (
                    <img src={scrap.pictureUrl} alt="Scrap" className="mt-2 w-full h-40 object-cover rounded-md" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Bid Button */}
        {/* <div className="mt-10 text-center">
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            onClick={handleCreateBid}
          >
            🏷️ Create Bid
          </button>
        </div> */}
      </div>
    </section>
  );
}
