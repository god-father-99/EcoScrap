"use client";

export default function ScrapPortal() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Scrap Portal</h1>
      <p className="text-gray-600 mb-6">Sell or buy scrap easily.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md p-4 rounded-lg">
          <img src="/electronic.jpg" alt="Electronics" className="w-full h-40 object-cover rounded-md" />
          <h2 className="text-lg font-semibold mt-3">Old Electronics</h2>
          <p className="text-xl font-bold text-blue-600">₹1500</p>
        </div>

        <div className="bg-white shadow-md p-4 rounded-lg">
          <img src="/metal.jpg" alt="Metal Waste" className="w-full h-40 object-cover rounded-md" />
          <h2 className="text-lg font-semibold mt-3">Metal Waste</h2>
          <p className="text-xl font-bold text-blue-600">₹500</p>
        </div>

        <div className="bg-white shadow-md p-4 rounded-lg">
          <img src="/plastic.jpg" alt="Plastic Bottles" className="w-full h-40 object-cover rounded-md" />
          <h2 className="text-lg font-semibold mt-3">Plastic Bottles</h2>
          <p className="text-xl font-bold text-blue-600">₹200</p>
        </div>
      </div>
    </div>
  );
}
