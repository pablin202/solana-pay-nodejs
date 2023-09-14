const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true }));

app.get("/", (req, res) => {
  return res.status(200).json({ status: true });
});

const admin = require("firebase-admin");
const serviceAccount = require("./credential.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

app.use('/pay', require("./api/pay.js"));

const functions = require("firebase-functions");
exports.app = functions.https.onRequest(app);
