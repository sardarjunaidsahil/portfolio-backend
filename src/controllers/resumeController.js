const path = require("path");
const fs = require("fs");
const { pool } = require("../db");

async function downloadResume(req, res) {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
    const referrer = req.headers["referer"] || "";

    try {
        await pool.query(
            `INSERT INTO resume_downloads (ip, referrer) VALUES ($1,$2)`,
            [ip, referrer]
        );
        await pool.query(
            `INSERT INTO analytics (event, page, referrer, user_agent, ip) VALUES ($1,$2,$3,$4,$5)`,
            ["resume_download", "/resume", referrer, req.headers["user-agent"] || "", ip]
        );

        const filePath = path.join(__dirname, "../../public/resume.pdf");
        if (fs.existsSync(filePath)) {
            res.setHeader("Content-Disposition", 'attachment; filename="Junaid_Sahil_Resume.pdf"');
            res.setHeader("Content-Type", "application/pdf");
            return res.sendFile(filePath);
        } else {
            return res.status(404).json({ success: false, message: "Resume file not found." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Download failed." });
    }
}

async function viewResume(req, res) {
    const filePath = path.join(__dirname, "../../public/resume.pdf");
    if (fs.existsSync(filePath)) {
        res.setHeader("Content-Disposition", 'inline; filename="Junaid_Sahil_Resume.pdf"');
        res.setHeader("Content-Type", "application/pdf");
        return res.sendFile(filePath);
    } else {
        return res.status(404).json({ success: false, message: "Resume file not found." });
    }
}

async function getDownloadCount(req, res) {
    try {
        const { rows } = await pool.query(`SELECT COUNT(*) AS total FROM resume_downloads`);
        res.json({ success: true, total: parseInt(rows[0].total) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = { downloadResume, viewResume, getDownloadCount };