const express = require("express");
const cors = require("cors");
const { Agent } = require("undici");

const app = express();
const PORT = 3000;

// ===== Undici dispatcher (RẤT QUAN TRỌNG) =====
const dispatcher = new Agent({
    keepAliveTimeout: 0,
    keepAliveMaxTimeout: 0,
    connections: 1
});

// ===== Middleware =====
app.use(cors());

// ===== ROUTE TEST SJC =====
app.get("/api/gold/sjc", async (req, res) => {
    try {
        const response = await fetch(
            "https://sjc.com.vn/GoldPrice/Services/PriceService.ashx",
            {
                dispatcher,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Accept": "application/json",
                    "Accept-Language": "vi-VN,vi;q=0.9",
                    "Connection": "close"
                }
            }
        );

        const text = await response.text();

        if (!text) {
            throw new Error("Empty response from SJC");
        }

        // thử parse JSON
        const data = JSON.parse(text);

        res.json({
            success: true,
            source: "sjc",
            data
        });
    } catch (err) {
        console.error("❌ SJC error:", err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
