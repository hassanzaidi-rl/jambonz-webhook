const express = require("express");
const http = require("http");

const app = express();
app.use(express.json());

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Webhook server running"
  });
});

/**
 * Jambonz OUTBOUND call control webhook
 */
app.post("/outbound-hook", (req, res) => {
  const response = {
    actions: [
      {
        verb: "connect",
        endpoint: {
          type: "websocket",
          uri: "wss://rapid-bot.duckdns.org/converse?avatar_name=Lori&language=english&prompt=Clarke",
          audio: {
            codec: "linear16",
            sampleRate: 8000,
            channels: 1
          }
        }
      }
    ]
  };

  console.log("JAMBONZ OUTBOUND HOOK REQUEST:", req.body);
  console.log("JAMBONZ OUTBOUND HOOK RESPONSE:", response);

  res.status(200).json(response);
});

/**
 * Optional call status webhook
 */
app.post("/call-status", (req, res) => {
  console.log("CALL STATUS:", req.body);
  res.status(200).json({ status: "ok" });
});

/**
 * Start server (Render compatible)
 */
const PORT = process.env.PORT || 3000;
http.createServer(app).listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
