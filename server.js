const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const { Resend } = require("resend");

const app = express();
const PORT = 4000;
const SECRET = "supersecretjwt"; // put in .env
const resend = new Resend(process.env.RESEND_API_KEY); 

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Render
});


// ====== Middleware to Protect Routes ======
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // { id, restaurant_slug }
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ====== Auth Routes ======

// Register a new business
app.post("/api/register", async (req, res) => {
  const { name, email, password, slug } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO businesses (name, email, password_hash, restaurant_slug)
       VALUES ($1, $2, $3, $4) RETURNING id, name, restaurant_slug`,
      [name, email, hashed, slug]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Registration failed" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM businesses WHERE email=$1", [email]);

  if (result.rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

  const business = result.rows[0];
  const valid = await bcrypt.compare(password, business.password_hash);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: business.id, restaurant_slug: business.restaurant_slug },
    SECRET,
    { expiresIn: "1d" }
  );
  res.json({ token, business: { id: business.id, name: business.name, slug: business.restaurant_slug } });
});

// ====== Promotions Routes ======

// Create promotion (only one active at a time)
app.post("/api/promotions", authMiddleware, async (req, res) => {
  const { html, startDate, endDate } = req.body;
  const businessId = req.user.id;

  // check if active promo already exists
  const existing = await pool.query(
    "SELECT * FROM promotions WHERE business_id=$1 AND active=true",
    [businessId]
  );
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: "An active promotion already exists." });
  }

  const result = await pool.query(
    `INSERT INTO promotions (business_id, html, active, start_date, end_date)
     VALUES ($1, $2, true, $3, $4)
     RETURNING *`,
    [businessId, html, startDate, endDate]
  );

  res.json(result.rows[0]);
});

// Get active promotion for widget
app.get("/api/promotions", async (req, res) => {
  const { restaurant } = req.query;
  if (!restaurant) return res.status(400).json({ error: "restaurant is required" });

  const business = await pool.query("SELECT id FROM businesses WHERE restaurant_slug=$1", [restaurant]);
  if (business.rows.length === 0) return res.json({ active: false });

  const promo = await pool.query(
    `SELECT * FROM promotions 
     WHERE business_id=$1 AND active=true 
     ORDER BY created_at DESC LIMIT 1`,
    [business.rows[0].id]
  );

  if (promo.rows.length === 0) return res.json({ active: false });

  res.json(promo.rows[0]);
});

// Deactivate promotion (for admin to end early)
app.post("/api/promotions/deactivate", authMiddleware, async (req, res) => {
  const businessId = req.user.id;
  await pool.query("UPDATE promotions SET active=false WHERE business_id=$1", [businessId]);
  res.json({ success: true });
});

app.get("/api/promotions/me", authMiddleware, async (req, res) => {
  const businessId = req.user.id;
  const promo = await pool.query(
    `SELECT * FROM promotions   
     WHERE business_id=$1 AND active=true 
     ORDER BY created_at DESC LIMIT 1`,
    [businessId]
  );

  if (promo.rows.length === 0) return res.json({ active: false });
  res.json(promo.rows[0]);
});

// ===== Lead Capture Route =====
app.post("/api/leads", async (req, res) => {
  const { restaurantName, contactName, email, phone, website } = req.body;

  try {
    // Save lead in DB (optional table)
    // await pool.query(
    //   `INSERT INTO leads (restaurant_name, contact_name, email, phone, website, created_at)
    //    VALUES ($1,$2,$3,$4,$5,NOW())`,
    //   [restaurantName, contactName, email, phone, website]
    // );

    // Send confirmation email to user
    await resend.emails.send({
      from: "Lytebaux <team@lytebaux.com>",
      to: email,
      subject: "Thanks for Signing Up with Lytebaux",
      html: `
        <p>Hi <b>${contactName}</b>,</p>
        <p>Thanks for reaching out to <b>Lytebaux</b>!</p>
        <p>Next steps:</p>
        <ul>
          <li>We’ll contact you shortly to schedule a quick onboarding call.</li>
          <li>You’ll get access to your admin dashboard.</li>
          <li>From there, you can start creating promotions instantly.</li>
        </ul>
        <p>– The Lytebaux Team 💜</p>
      `,
    });

    // Notify internal admin email
    // await resend.emails.send({
    //   from: "Lytebaux <noreply@lytebaux.com>",
    //   to: process.env.ADMIN_EMAIL,
    //   subject: "📩 New Lead Captured",
    //   html: `
    //     <h3>New Lead</h3>
    //     <p><b>Business:</b> ${restaurantName}</p>
    //     <p><b>Contact:</b> ${contactName}</p>
    //     <p><b>Email:</b> ${email}</p>
    //     <p><b>Phone:</b> ${phone || "N/A"}</p>
    //     <p><b>Website:</b> ${website || "N/A"}</p>
    //   `,
    // });

    res.json({ success: true, message: "Lead captured and confirmation email sent." });
  } catch (err) {
    console.error("Lead error:", err);
    res.status(500).json({ error: "Failed to capture lead." });
  }
});




app.listen(PORT, () => console.log(`✅ API running at http://localhost:${PORT}`));
