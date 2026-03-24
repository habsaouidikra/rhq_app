const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static illustrations
app.use("/illustrations", express.static(path.join(__dirname, "public/illustrations")));

// API routes
app.use("/api/rhq", require("./routes/rhq"));
app.use("/api/admin", require("./routes/admin").router);

// Serve frontend build from backend/dist
const frontendBuild = path.join(__dirname, "dist"); // <- backend/dist folder
app.use(express.static(frontendBuild));

// Handle all other routes and serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuild, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
