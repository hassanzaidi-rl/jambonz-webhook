import express from "express";

const app = express();
app.use(express.json());

// root route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Webhook server running" });
});

// AppEnv validation
app.options("/outbound-hook", (req, res) => {
  res.json({
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    additionalProperties: true
  });
});

// Outbound webhook (call control)
app.post("/outbound-hook", (req, res) => {
  const from = req.body?.from || "";
  const to = req.body?.to?.number || "";

  console.log("OUTBOUND /outbound-hook called:", req.body);

  if (!from || !to) {
    return res.json({ actions: [{ verb: "hangup" }] });
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

app.get("/outbound-hook", (_req, res) => {
  res.json({
    "$schema":"http://json-schema.org/draft-07/schema#",
    "type":"object",
    "additionalProperties": true
  });
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

