const { Client } = require("@gr4vy/node");
const fs = require("fs");
const http = require("http");

const key = String(fs.readFileSync("./private_key.pem"));

const config = {
  gr4vyId: "YOUR_INSTANCE_ID",
  merchantAccountId: "default",
  sandbox: true,
  amount: 0.01,
  currency: "USD",
};

const server = http.createServer(async (req, res) => {
  // Allow requests from the Android emulator
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.url === "/token") {
    try {
      const client = new Client({
        gr4vyId: config.gr4vyId,
        privateKey: key,
        environment: config.sandbox ? "sandbox" : "production",
      });

      const token = await client.getEmbedToken({
        amount: config.amount * 100,
        currency: config.currency,
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ token }));
    } catch (err) {
      console.error("Token generation error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3002, () => {
  console.log("Token server running at http://localhost:3002");
  console.log(`gr4vyId: ${config.gr4vyId}`);
  console.log(`environment: ${config.sandbox ? "sandbox" : "production"}`);
});
