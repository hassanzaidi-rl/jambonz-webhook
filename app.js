import express from "express";

const app = express();
app.use(express.json());

// Root route — health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Webhook server running" });
});

// AppEnv validation for Jambonz UI (schema fetch)
app.options("/outbound-hook", (_req, res) => {
  res.json({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "additionalProperties": true
  });
});

// Also serve schema on GET (helps UI validation)
app.get("/outbound-hook", (_req, res) => {
  res.json({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "additionalProperties": true
  });
});

// Outbound webhook (call control)
app.post("/outbound-hook", (req, res) => {
  const from = req.body?.from || "";
  const to   = req.body?.to?.number || "";

  console.log("OUTBOUND /outbound-hook called:", req.body);

  if (!from || !to) {
    console.log("Missing from/to — hanging up");
    return res.json({ actions: [{ verb: "hangup" }] });
  }

  const response = {
    actions: [
      {
        verb: "dial",
        callerId: from,
        target: [
          {
            type: "phone",
            number: to,
            trunk: "jambonz-sip-trunk"
          }
        ]
      }
    ]
  };

  console.log("OUTBOUND webhook response:", response);

  return res.json(response);
});

// Call status webhook
app.post("/call-status", (req, res) => {
  console.log("CALL STATUS:", req.body);
  res.json({ status: "ok" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on ${PORT}`);
});
