const { pool } = require("../db");

async function trackEvent(req, res) {
    const { event, page, referrer } = req.body;
    if (!event) return res.status(400).json({ success: false, message: "Event required." });

    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
    const user_agent = req.headers["user-agent"] || "";

    try {
        await pool.query(
            `INSERT INTO analytics (event, page, referrer, user_agent, ip) VALUES ($1,$2,$3,$4,$5)`,
            [event, page || null, referrer || null, user_agent, ip]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
}

async function getStats(req, res) {
    try {
        const { rows: totalRows } = await pool.query(
            `SELECT COUNT(*) AS total FROM analytics WHERE event = 'page_view'`
        );
        const { rows: pageRows } = await pool.query(
            `SELECT page, COUNT(*) AS views FROM analytics WHERE event='page_view' AND page IS NOT NULL GROUP BY page ORDER BY views DESC`
        );
        const { rows: dailyRows } = await pool.query(
            `SELECT DATE(created_at) AS date, COUNT(*) AS views FROM analytics WHERE event='page_view' AND created_at >= NOW() - INTERVAL '14 days' GROUP BY DATE(created_at) ORDER BY date ASC`
        );
        const { rows: dlRows } = await pool.query(`SELECT COUNT(*) AS total FROM resume_downloads`);
        const { rows: contactRows } = await pool.query(`SELECT COUNT(*) AS total FROM contacts`);

        res.json({
            success: true,
            data: {
                totalViews: parseInt(totalRows[0].total),
                resumeDownloads: parseInt(dlRows[0].total),
                totalContacts: parseInt(contactRows[0].total),
                viewsPerPage: pageRows,
                dailyViews: dailyRows,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = { trackEvent, getStats };