import { query } from "@/lib/db";  // Make sure query is correctly set up in db.js or db.ts
import { NextApiRequest, NextApiResponse } from "next";

const submitComplaint = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { title, description, address, imageUrl } = req.body;

      // Validate request body
      if (!title || !description || !address || !imageUrl) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Insert complaint into the database
      const result = await query(
        "INSERT INTO complaint (title, description, address, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
        [title, description, address, imageUrl]
      );

      // Respond with success
      res.status(200).json({ message: "Complaint submitted successfully", complaint: result.rows[0] });
    } catch (error) {
      console.error("Error submitting complaint:", error);
      res.status(500).json({ message: "An error occurred while submitting your complaint" });
    }
  } else {
    // If method is not POST, return Method Not Allowed
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default submitComplaint;
