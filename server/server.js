const express = require("express");
const app = express();
require("dotenv").config();
const path = require("path");
const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const extractTextFromDoc = require("./extractTextFromDoc");
const bodyParser = require("body-parser");
const { log } = require("console");
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client", "build")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//***************** Endpoint TWILIO ******************//
app.post("/api/twilio/messages", async (req, res) => {
  try {
    res.header("Content-Type", "application/json");
    await twilio.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: req.body.to,
      body: req.body.body,
    });
    res.send(JSON.stringify({ success: true }));
  } catch (err) {
    console.log(err);
    res.send(JSON.stringify({ success: false }));
  }
});
//****************************************************//

//**************** Endpoint DOCUMENT AI **************//
app.post("/api/extractToText", async (req, res) => {
  try {
    const { docUrl, mime } = req.body;
    console.log(docUrl);
    console.log(mime);
    const result = await extractTextFromDoc(docUrl, mime);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.send(JSON.stringify({ success: false }));
    res.status(500).json({ success: false, error: err.message });
  }
});

//****************************************************//

//Dans les autres cas on renvoie la single page app
app.get("/*", (_, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Le serveur est lancé sur le port ${PORT}`);
});
