import express from "express";

const app = express();

// parse JSON bodies
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Webhook server running" });
});

// Support GET on outbound-hook (for UI/schema validation)
app.get("/outbound-hook", (_req, res) => {
  res.json({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "additionalProperties": true
  });
});

// POST handler for outbound-hook
app.post("/outbound-hook", (req, res) => {
  const from = req.body?.from || "";
  const to_number = req.body?.to?.number || "";

  console.log("OUTBOUND /outbound-hook called:", req.body);

  if (!from || !to_number) {
    console.log("Missing from/to — will hang up");
    return res.json({
      instructions: [
        { hangup: {} }
      ]
    });
  }

  const response = {
    instructions: [
      {
        dial: {
          target: [
            {
              type: "phone",
              number: to_number,
              trunk: "jambonz-sip-trunk" // match your Jambonz carrier name
            }
          ],
          timeout: 30
        }
      }
    ]
  };

  console.log("OUTBOUND webhook response (Jambonz):", response);

  res.json(response);
});

// POST handler for call-status webhook
app.post("/call-status", (req, res) => {
  console.log("CALL STATUS:", req.body);
  res.json({ status: "ok" });
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
