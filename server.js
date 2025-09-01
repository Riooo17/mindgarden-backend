import express from "express";
import axios from "axios";
import cors from "cors";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔑 Load from environment variables
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!PAYSTACK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error("❌ Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// ✅ Initialize payment
app.post("/create-payment", async (req, res) => {
  const { email, amount } = req.body;

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount, // in kobo (KES*100)
        callback_url: "https://your-frontend.netlify.app/success.html"
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    res.json({ authorization_url: response.data.data.authorization_url });
  } catch (err) {
    console.error("Paystack Init Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// ✅ Paystack webhook (set in Paystack Dashboard)
app.post("/paystack-webhook", async (req, res) => {
  const event = req.body;

  if (event.event === "charge.success") {
    const email = event.data.customer.email;

    console.log(`✅ Payment success for ${email}`);

    // Update Supabase profile
    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: true })
      .eq("email", email);

    if (error) {
      console.error("❌ Supabase update error:", error.message);
    } else {
      console.log(`⭐ User ${email} upgraded to premium`);
    }
  }

  res.sendStatus(200);
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("✅ Paystack Backend Running");
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
