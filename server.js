import express from "express";
import fetch from "node-fetch";
import NodeCache from "node-cache";
import cors from "cors";

const app = express();
const PORT = 3000;

// cache 5 phút
const cache = new NodeCache({ stdTTL: 300 });

app.use(cors());

// ===== CONFIG =====
const SJC_API =
    "https://sjc.com.vn/GoldPrice/Services/PriceService.ashx";

const FETCH_HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "application/json",
    "Accept-Language": "vi-VN,vi;q=0.9"
};

// ===== ROUTE =====
app.get("/api/gold/sjc", async (req, res) => {
    try {
        // 1. Check cache
        const cached = cache.get("sjc_price");
        if (cached) {
            return res.json({
                source: "cache",
                ...cached
            });
        }

        // 2. Fetch from SJC
        const response = await fetch(SJC_API, {
            headers: FETCH_HEADERS,
            timeout: 10000
        });

        const text = await response.text();

        if (!text) {
            throw new Error("Empty response from SJC");
        }

        const json = JSON.parse(text);

        if (!json.success) {
            throw new Error("SJC API returned success=false");
        }

        // 3. Chuẩn hóa dữ liệu (ví dụ chỉ lấy SJC HCM)
        const sjcHCM = json.data.filter(
            item =>
                item.TypeName.includes("Vàng SJC") &&
                item.BranchName === "Hồ Chí Minh"
        );

        const result = {
            updatedAt: json.latestDate,
            items: sjcHCM.map(i => ({
                type: i.TypeName,
                branch: i.BranchName,
                buy: i.BuyValue,
                sell: i.SellValue
            }))
        };

        // 4. Save cache
        cache.set("sjc_price", result);

        res.json({
            source: "sjc",
            ...result
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            error: true,
            message: err.message
        });
    }
});

// ===== START =====
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
