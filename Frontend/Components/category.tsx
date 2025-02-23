"use client"; // ✅ Add this at the top

import { useRouter } from "next/navigation";
import Navbar from "./Navbar";

export default function CategorySelection() {
  const router = useRouter();
  const categories = ["Metal", "Plastic", "Electronics", "Paper", "Glass"];

  return (
    <>
      <Navbar />
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Select Scrap Category</h2>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => router.push("/schedule")}
            className="w-full bg-gray-200 text-black p-2 mt-2 rounded hover:bg-gray-300 transition"
          >
            {category}
          </button>
        ))}
      </div>
    </>
  );
}
