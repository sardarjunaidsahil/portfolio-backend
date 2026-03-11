const rateLimit = require("express-rate-limit");

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many messages. Try again in 15 minutes." },
});

const analyticsLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    message: { success: false, message: "Too many requests." },
});

module.exports = { contactLimiter, analyticsLimiter };