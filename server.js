const express = require("express");
const app = express();
const PORT = 4000;
const cors = require("cors");

app.use(cors()); 
app.use(express.static(__dirname)); // ✅ serves widget.js

// Mock promotions data
const promotions = {
  "pizza-palace": {
    active: true,
    title: "Valentine's Day",
    description: "Buy one meal, get one free",
    start: "2025-09-01",
    end: "2025-09-30",
  },
  "burger-barn": {
    active: true,
    title: "🍔 Free Fries with Any Burger",
    description: "Valid all September, dine-in only.",
    start: "2025-09-01",
    end: "2025-09-15",
  },
};

// API endpoint for widget to call
app.get("/api/promotions", (req, res) => {
  const restaurant = req.query.restaurant;
  const promo = promotions[restaurant];
  res.json(promo || { active: false });
});

app.listen(PORT, () =>
  console.log(`✅ Promotion API running at http://localhost:${PORT}`)
);
