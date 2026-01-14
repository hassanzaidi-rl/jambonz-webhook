import express from "express";
import http from "http";

const app = express();
app.use(express.json());

/**
 * Health check
 */
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Webhook server running"
  });
});

/**
 * Jambonz Call Control Webhook (OUTBOUND)
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

  console.log("JAMBONZ OUTBOUND HOOK PAYLOAD:", req.body);
  console.log("JAMBONZ RESPONSE:", response);

  return res.status(200).json(response);
});

/**
 * Optional call status webhook
 */
app.post("/call-status", (req, res) => {
  console.log("CALL STATUS:", req.body);
  res.status(200).json({ status: "ok" });
});

/**
 * Force HTTP/1.1
 */
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
