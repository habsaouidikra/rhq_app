const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/illustrations", express.static(path.join(__dirname, "public/illustrations")));

app.use("/api/rhq", require("./routes/rhq"));
app.use("/api/admin", require("./routes/admin").router);

const frontendBuild = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendBuild));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuild, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
