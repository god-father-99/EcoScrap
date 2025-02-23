"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DonationAgenciesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    toast.info("Fetching data...", { position: "top-right" });
    setTimeout(() => setLoading(false), 2000);
  }, []);

  const agencies = [
    { name: "nirmalafoundation | Delhi", phone: "+91-7669001136", email: "nirmalafoundation.org", image: "https://www.nirmalafoundation.org/wp-content/uploads/2021/09/wlogo.png" },
    { name: "niyateefoundation | Dumduma Bhubaneswar", phone: "+9348763539", email: "Niyatee Foundation, Dumduma", image: "https://www.niyateefoundation.org/images/niyatee-logo.png" },
    { name: "Gram-Utthan | Balianta, Bhubaneswar ", phone: "06742463364", email: "https://www.gramutthan.org/", image: "https://www.gramutthan.org/assets/user/images/logo.png" },
    { name: "Aaina | Bhubaneswar", phone: "+91 (0674)2360630", email: "http://www.aaina.org.in/", image: "https://www.aaina.org.in/images_25/logo-25-s1.png" },
    { name: "BAL-RAKSHA-BHARAT", phone: "+9988776655", email: "BAL-RAKSHA-BHARAT.org", image: "https://balrakshabharat.org/wp-content/uploads/2023/07/BAL-RAKSHA-BHARAT_GIF-logo-for-website_24-July-2023-1.gif" },
    { name: "Amar Andika | Bhubaneswar", phone: "+91 674-2435161", email: "info@newhopengo.org", image: "https://cdn.givind.org/static/images/giveindia-logo-v2.jpg" },
    { name: "udayfoundation | Delhi", phone: "011-41098444", email: "udayfoundation.org", image: "https://www.udayfoundation.org/wp-content/uploads/2018/09/UDAY-LOGO-3.jpg" },
    { name: "utkalakrantifoundation | Bhubaneswar", phone: "+3322115544", email: "utkalakrantifoundation.org", image: "https://www.utkalakrantifoundation.org/assets/images/logo.jpg" }
  ];

  return (
    <div className="p-6 text-center bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-orange-700">
        "Give warmth, Give hope - Donate your old clothes to those in need!"
      </h1>
      
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {["http://himfoundation.in/images/gallery/diwali-celebration2022-img26.jpg", "https://tse1.mm.bing.net/th?id=OIP.BG8bSCDFsGCYmHTHSTpJdwHaDC&pid=Api&P=0&h=220", "https://cpi.edu.in/wp-content/uploads/2023/05/cloth-1024x460.jpg", "https://tse2.mm.bing.net/th?id=OIP.Y00asbRUv98wqsSCOxeODAHaES&pid=Api&P=0&h=220"].map((image, index) => (
          <img key={index} src={image} alt="Donation" className="rounded-lg w-72 h-48 shadow-lg" />
        ))}
      </div>

      <h2 className="text-xl text-gray-800"> Donation Agencies </h2>
      <p className="text-gray-600">Find agencies that help distribute clothes to those in need.</p>
      
      {loading ? (
        <p className="text-lg text-gray-500">Loading agencies...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {agencies.map((agency, index) => (
            <div key={index} className="border rounded-lg p-4 text-center shadow-md bg-white">
              <img src={agency.image} alt={agency.name} className="w-full rounded-lg mb-3" />
              <h3 className="text-lg font-semibold">{agency.name}</h3>
              <p className="text-gray-600">Phone: {agency.phone}</p>
              <p className="text-gray-600">Email: {agency.email}</p>
              <button 
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                onClick={() => window.location.href = `tel:${agency.phone}`}
              >
                Call Now
              </button>
              <button 
                className="mt-3 ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                onClick={() => window.location.href = `mailto:${agency.email}`}
              >
                Send Enquiry
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 p-6 border rounded-lg max-w-md mx-auto shadow-md bg-white">
        <h2 className="text-xl font-semibold text-gray-800">Donate Your Items</h2>
        <form className="mt-4">
          <input type="text" placeholder="Your Name" className="w-full p-3 mb-3 border rounded-lg" />
          <input type="email" placeholder="Your Email" className="w-full p-3 mb-3 border rounded-lg" />
          <input type="text" placeholder="Your Phone Number" className="w-full p-3 mb-3 border rounded-lg" />
          <textarea placeholder="Describe the items you want to donate" className="w-full p-3 mb-3 border rounded-lg h-28"></textarea>
          <button type="submit" className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
            Submit Donation
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonationAgenciesPage;