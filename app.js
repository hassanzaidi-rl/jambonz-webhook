app.post("/outbound-hook", (req, res) => {
  const from = req.body?.from || "";
  const to_number = req.body?.to?.number || "";

  console.log("OUTBOUND /outbound-hook called:", req.body);

  if (!from || !to_number) {
    console.log("Missing from/to — will hang up");
    return res.json({
      instructions: [
        {
          hangup: {}
        }
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
              trunk: "jambonz-sip-trunk" // Must match your carrier name
            }
          ],
          timeout: 30
        }
      }
    ]
  };

  console.log("OUTBOUND webhook response (Jambonz format):", response);

  return res.json(response);
});
