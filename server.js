import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const GOOGLE_SCRIPT_FETCH_URL =
  "https://script.google.com/macros/s/AKfycbxaCS2TTn0Exo-7lnSwXa4ODBDeK081hjTFQyNAC1oWX4kvTgoZe2J_nYE2ddu5KZJi/exec";

let studentData = {
  firstIds: [],
  secondIds: [],
  thirdIds: [],
  fourthIds: [],
};

// Fetch Student Data from Google Sheets
const fetchStudentData = async () => {
  try {
    const { data } = await axios.get(GOOGLE_SCRIPT_FETCH_URL);
    if (!data || typeof data !== "object")
      throw new Error("❌ Invalid data format from Google Sheets");

    studentData = {
      firstIds: data.firstIds?.map((id) => id.trim().toUpperCase()) || [],
      secondIds: data.secondIds?.map((id) => id.trim().toUpperCase()) || [],
      thirdIds: data.thirdIds?.map((id) => id.trim().toUpperCase()) || [],
      fourthIds: data.fourthIds?.map((id) => id.trim().toUpperCase()) || [],
    };

   
  } catch (error) {
   
  }
};

fetchStudentData();
setInterval(fetchStudentData, 5 * 60 * 1000); // Refresh every 5 minutes

// API Routes
app.get("/exam", (req, res) => res.json({ success: true, studentData }));

app.post("/exam/submit", (req, res) => {
  const { id, year } = req.body;
  if (!id || !year) {
    return res.status(400).json({ success: false, message: "⚠️ Missing ID or Year" });
  }

  const inputId = id.trim().toUpperCase();
  let validIds = [];

  switch (year) {
    case "round1":
      validIds = studentData.firstIds;
      break;
    case "round2":
      validIds = studentData.secondIds;
      break;
    case "round3":
      validIds = studentData.thirdIds;
      break;
    case "round4":
      validIds = studentData.fourthIds;
      break;
    default:
      return res.status(400).json({ success: false, message: "❌ Invalid Round" });
  }

  if (validIds.includes(inputId)) {
  
    return res.json({ success: true, message: "✅ ID Verified" });
  } else {
    
    return res.status(401).json({ success: false, message: "❌ Invalid Student ID" });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
