const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 3000;
const KIMI_URL = "https://api.kimi.com/coding";

app.use(express.raw({ type: "*/*", limit: "10mb" }));

app.all("*", async (req, res) => {
  const targetUrl = KIMI_URL + req.originalUrl;
  const cleanHeaders = {};
  ["authorization", "content-type", "accept", "user-agent"].forEach(h => {
    if (req.headers[h]) cleanHeaders[h] = req.headers[h];
  });
  
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: cleanHeaders,
      body: req.body,
      redirect: "follow"
    });
    response.headers.forEach((v, k) => {
      if (!["content-encoding", "content-length"].includes(k)) res.setHeader(k, v);
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(response.status);
    response.body.pipe(res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log("Proxy running on port", PORT));
