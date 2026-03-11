require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDB } = require("./db");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173"],
    credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use("/api", routes);

app.use((req, res) => res.status(404).json({ success: false, message: "Not found" }));
app.use((err, req, res, next) => res.status(500).json({ success: false, message: "Server error" }));

async function start() {
    await initDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

start().catch(console.error);