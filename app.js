import express from "express";
import http from "http";

// build express app
const app = express();
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  const body = JSON.stringify({ status: "ok", message: "Webhook server running" });
  res.setHeader("Connection", "close");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.setHeader("Content-Type", "application/json");
  res.write(body);
  res.end();
});

// GET schema support for outbound-hook
app.get("/outbound-hook", (_req, res) => {
  const body = JSON.stringify({
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    additionalProperties: true
  });
  res.setHeader("Connection", "close");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.setHeader("Content-Type", "application/json");
  res.write(body);
  res.end();
});

// POST handler for outbound-hook
app.post("/outbound-hook", (req, res) => {
  try {
    const from = req.body?.from || "";
    const to_number = req.body?.to?.number || "";

    // immediate hangup if missing
    if (!from || !to_number) {
      const hangupBody = JSON.stringify({
        instructions: [ { hangup: {} } ]
      });
      res.setHeader("Connection", "close");
      res.setHeader("Content-Length", Buffer.byteLength(hangupBody));
      res.setHeader("Content-Type", "application/json");
      res.write(hangupBody);
      res.end();
      return;
    }

    const responseObj = {
      instructions: [
        {
          dial: {
            callerId: from,
            target: [
              {
                type: "phone",
                number: to_number,
                trunk: "jambonz-sip-trunk",
                carrier: "jambonz-sip-trunk"
              }
            ],
            timeout: 30
          }
        }
      ]
    };

    const body = JSON.stringify(responseObj);
    res.setHeader("Connection", "close");
    res.setHeader("Content-Length", Buffer.byteLength(body));
    res.setHeader("Content-Type", "application/json");
    res.write(body);
    res.end();

    // log async
    setImmediate(() => {
      console.log("OUTBOUND webhook body:", req.body);
      console.log("OUTBOUND webhook response:", responseObj);
    });

  } catch (err) {
    const hangupBody = JSON.stringify({
      instructions: [ { hangup: {} } ]
    });
    res.setHeader("Connection", "close");
    res.setHeader("Content-Length", Buffer.byteLength(hangupBody));
    res.setHeader("Content-Type", "application/json");
    res.write(hangupBody);
    res.end();

    setImmediate(() => {
      console.error("Error in outbound-hook:", err);
    });
  }
});

// POST handler for call-status webhook
app.post("/call-status", (req, res) => {
  const body = JSON.stringify({ status: "ok" });
  res.setHeader("Connection", "close");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.setHeader("Content-Type", "application/json");
  res.write(body);
  res.end();

  setImmediate(() => {
    console.log("CALL STATUS webhook:", req.body);
  });
});

// Use plain HTTP server to avoid chunked or HTTP/2
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT} (HTTP/1.1 only)`);
});
