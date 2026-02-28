import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // frontend URL
}));

app.get("/", (req, res) => {
  res.json({ message: "IHSAN Backend Running 🚀" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});