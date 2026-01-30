const https = require("https");

const agent = new https.Agent({
    keepAlive: false,
    maxSockets: 1
});

const response = await fetch(
    "https://sjc.com.vn/GoldPrice/Services/PriceService.ashx",
    {
        agent,
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
console.log(text);
