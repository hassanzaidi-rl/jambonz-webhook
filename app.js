import express from "express";

const app = express();
app.use(express.json());

/**
 * 🔹 REQUIRED: AppEnv schema endpoint
 * Jambonz UI calls this to validate webhook
 */
app.options("/outbound-hook", (req, res) => {
  res.json({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "additionalProperties": true
  });
});

/**
 * 🔹 Actual outbound call webhook
 */
app.post("/outbound-hook", (req, res) => {
  const from = req.body.from;
  const to = req.body.to?.number;

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
 * 🔹 Call status hook
 */
app.post("/call-status", (req, res) => {
  res.json({});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Webhook running on port", PORT);
});
