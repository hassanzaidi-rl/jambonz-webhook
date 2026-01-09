import express from "express";
import http from "http";

// build express app
const app = express();
app.use(express.json());

/**
 * Health check
 */
app.get("/", (_req, res) => {
  const body = JSON.stringify({
    status: "ok",
    message: "Webhook server running"
  });

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.setHeader("Connection", "close");
  res.end(body);
});

/**
 * GET schema support for outbound-hook
 */
app.get("/outbound-hook", (_req, res) => {
  const body = JSON.stringify({
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    additionalProperties: true
  });

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.setHeader("Connection", "close");
  res.end(body);
});

/**
 * POST handler for outbound-hook
 * IMPORTANT:
 * - NO carrier
 * - NO trunk
 * - NO gateway
 * - PSTN routing is inferred automatically
 */
app.post("/outbound-hook", (req, res) => {
  try {
    const from = req.body?.from;
    const to = req.body?.to?.number;

    // hard fail if invalid payload
    if (!from || !to) {
      const body = JSON.stringify({
        instructions: [{ hangup: {} }]
      });

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Length", Buffer.byteLength(body));
      res.setHeader("Connection", "close");
      return res.end(body);
    }

    const response = {
      instructions: [
        {
          dial: {
            callerId: from,
            timeout: 30,
            target: [
              {
                type: "phone",
                number: to
              }
            ]
          }
        }
      ]
    };

    const body = JSON.stringify(response);

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Length", Buffer.byteLength(body));
    res.setHeader("Connection", "close");
    res.end(body);

    // async logging
    setImmediate(() => {
      console.log("OUTBOUND webhook request:", req.body);
      console.log("OUTBOUND webhook response:", response);
    });

  } catch (err) {
    const body = JSON.stringify({
      instructions: [{ hangup: {} }]
    });

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Length", Buffer.byteLength(body));
    res.setHeader("Connection", "close");
    res.end(body);

    setImmediate(() => {
      console.error("Error in outbound-hook:", err);
    });
  }
});

/**
 * Call status webhook
 */
app.post("/call-status", (req, res) => {
  const body = JSON.stringify({ status: "ok" });

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.setHeader("Connection", "close");
  res.end(body);

  setImmediate(() => {
    console.log("CALL STATUS webhook:", req.body);
  });
});

// Force HTTP/1.1 (no chunked, no HTTP/2)
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT} (HTTP/1.1)`);
});
