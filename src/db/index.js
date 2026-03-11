const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDB() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(150) NOT NULL,
      subject    VARCHAR(200) NOT NULL,
      message    TEXT         NOT NULL,
      ip         VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS analytics (
      id         SERIAL PRIMARY KEY,
      event      VARCHAR(100) NOT NULL,
      page       VARCHAR(200),
      referrer   VARCHAR(300),
      user_agent TEXT,
      ip         VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS resume_downloads (
      id         SERIAL PRIMARY KEY,
      ip         VARCHAR(50),
      referrer   VARCHAR(300),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
    console.log("✅ Database tables ready");
}

module.exports = { pool, initDB };