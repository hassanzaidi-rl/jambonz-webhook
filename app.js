import express from "express";

const app = express();
app.use(express.json());

/**
 * Health check (optional)
 */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Webhook server running" });
});

/**
 * AppEnv validation for jambonz
 */
app.options("/outbound-hook", (req, res) => {
  res.json({
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    additionalProperties: true
  });
});

/**
 * Outbound webhook for call control
 */
app.post("/outbound-hook", (req, res) => {
  const from = req.body?.from || "";
  const to = req.body?.to?.number || "";

  if (!from || !to) {
    return res.json({
      actions: [{ verb: "hangup" }]
    });
  }

  return res.json({
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
  });
});

/**
 * Call status webhook
 */
app.post("/call-status", (req, res) => {
  console.log("Call status:", req.body);
  res.json({ status: "received" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on ${PORT}`);
});
