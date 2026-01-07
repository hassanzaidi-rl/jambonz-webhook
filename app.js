import express from "express";

const app = express();

// parse JSON bodies
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Webhook server running" });
});

// Support GET on outbound-hook for UI/schema
app.get("/outbound-hook", (_req, res) => {
  res.json({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "additionalProperties": true
  });
});

// POST handler for outbound-hook
app.post("/outbound-hook", (req, res) => {
  try {
    console.log("OUTBOUND /outbound-hook called:", req.body);

    const from = req.body?.from || "";
    const to_number = req.body?.to?.number || "";

    if (!from || !to_number) {
      console.log("Missing from or to — sending hangup");
      return res.json({
        instructions: [
          { hangup: {} }
        ]
      });
    }

    // *** IMPORTANT: Set a valid callerId that your SIP provider accepts ***
    // This should be a number you control and that is allowed on your trunk.
    const callerId = from;

    const response = {
      instructions: [
        {
          dial: {
            callerId: callerId,
            target: [
              {
                type: "phone",
                number: to_number,
                trunk: "jambonz-sip-trunk" // exactly match your trunk name
              }
            ],
            timeout: 30
          }
        }
      ]
    };

    console.log("OUTBOUND webhook response (Jambonz):", response);
    return res.json(response);

  } catch (err) {
    console.error("Error in outbound-hook:", err);
    return res.json({
      instructions: [
        { hangup: {} }
      ]
    });
  }
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
