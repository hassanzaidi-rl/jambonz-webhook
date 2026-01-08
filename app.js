import express from "express";

const app = express();

// parse JSON bodies
app.use(express.json());

// Force HTTP/1.1 by setting Connection header
app.use((req, res, next) => {
  res.setHeader("Connection", "close");
  next();
});

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Webhook server running" });
});

// Support GET on outbound-hook for UI/schema
app.get("/outbound-hook", (_req, res) => {
  res.json({
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    additionalProperties: true
  });
});

// POST handler for outbound-hook
app.post("/outbound-hook", (req, res) => {
  try {
    // Extract call details
    const from = req.body?.from || "";
    const to_number = req.body?.to?.number || "";

    // Immediately handle invalid cases
    if (!from || !to_number) {
      // immediate response with hangup instruction
      res.status(200).json({
        instructions: [
          { hangup: {} }
        ]
      });
      return;
    }

    // Build correct Jambonz response
    const response = {
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

    // Respond immediately
    res.status(200).json(response);

    // Async logging (does not delay response)
    setImmediate(() => {
      console.log("OUTBOUND /outbound-hook called:", req.body);
      console.log("OUTBOUND webhook response (Jambonz):", response);
    });

  } catch (err) {
    // In case of unexpected error, respond safely
    res.status(200).json({
      instructions: [
        { hangup: {} }
      ]
    });

    // Async log error
    setImmediate(() => {
      console.error("Error in outbound-hook:", err);
    });
  }
});

// POST handler for call-status webhook
app.post("/call-status", (req, res) => {
  // Respond immediately with OK
  res.status(200).json({ status: "ok" });

  // Async log so response is not delayed
  setImmediate(() => {
    console.log("CALL STATUS webhook received:", req.body);
  });
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
