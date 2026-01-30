import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 });

const SJC_API =
    "https://sjc.com.vn/GoldPrice/Services/PriceService.ashx";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const cached = cache.get("sjc_price");
        if (cached) {
            return res.json({
                source: "cache",
                ...cached
            });
        }

        const response = await fetch(SJC_API, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json",
                "Accept-Language": "vi-VN,vi;q=0.9"
            }
        });

        const text = await response.text();
        if (!text) throw new Error("Empty response from SJC");

        const json = JSON.parse(text);
        if (!json.success) throw new Error("SJC API failed");

        const sjcHCM = json.data.filter(
            i =>
                i.TypeName.includes("Vàng SJC") &&
                i.BranchName === "Hồ Chí Minh"
        );

        const result = {
            updatedAt: json.latestDate,
            items: sjcHCM.map(i => ({
                type: i.TypeName,
                buy: i.BuyValue,
                sell: i.SellValue
            }))
        };

        cache.set("sjc_price", result);

        res.status(200).json({
            source: "sjc",
            ...result
        });
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
}
