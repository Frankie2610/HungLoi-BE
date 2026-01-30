import express from "express";
import NodeCache from "node-cache";
import cors from "cors";

const app = express();
const PORT = 3000;

const cache = new NodeCache({ stdTTL: 300 });
app.use(cors());

const SJC_API =
    "https://sjc.com.vn/GoldPrice/Services/PriceService.ashx";

app.get("/api/gold/sjc", async (req, res) => {
    try {
        const cached = cache.get("sjc_price");
        if (cached) return res.json(cached);

        const response = await fetch(SJC_API, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        const text = await response.text();
        if (!text) throw new Error("Empty response");

        const json = JSON.parse(text);

        const result = {
            updatedAt: json.latestDate,
            items: json.data
        };

        cache.set("sjc_price", result);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
