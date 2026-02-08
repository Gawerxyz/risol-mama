const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// API Routes
app.post("/api/feedback", async (req, res) => {
  const { name, rating, text, timestamp } = req.body;

  const { data, error } = await supabase
    .from("feedback")
    .insert([{ name, rating, text, timestamp }])
    .select();

  if (error) {
    console.error("Error inserting feedback:", error.message);
    res.status(500).json({ error: error.message });
  } else {
    res.json({ id: data[0].id });
  }
});

app.get("/api/feedback", async (req, res) => {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Error retrieving feedback:", error.message);
    res.status(500).json({ error: error.message });
  } else {
    res.json(data);
  }
});

// Serve index.html for root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Serve admin.html for admin route
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Admin API Routes
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === "admin123") {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Password salah!" });
  }
});

app.delete("/api/admin/feedback/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("feedback").delete().eq("id", id);

  if (error) {
    console.error("Error deleting feedback:", error.message);
    res.status(500).json({ success: false, message: error.message });
  } else {
    res.json({ success: true });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server.");
  process.exit(0);
});
