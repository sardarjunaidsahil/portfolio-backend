const express = require("express");
const router = express.Router();

const { sendContact, getMessages } = require("../controllers/contactController");
const { trackEvent, getStats } = require("../controllers/analyticsController");
const { downloadResume, getDownloadCount, viewResume } = require("../controllers/resumeController");
const { contactLimiter, analyticsLimiter } = require("../middleware/rateLimiter");

router.post("/contact", contactLimiter, sendContact);
router.get("/contact/messages", getMessages);
router.post("/analytics/track", analyticsLimiter, trackEvent);
router.get("/analytics/stats", getStats);
router.get("/resume/download", downloadResume);
router.get("/resume/count", getDownloadCount);
router.get("/resume/view", viewResume);
router.get("/health", (req, res) => res.json({ success: true, status: "ok" }));

module.exports = router;