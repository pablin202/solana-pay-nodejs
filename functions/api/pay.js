const { clusterApiUrl, Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const { encodeURL, findTransactionSignature, } = require("@solana/pay");
const { BigNumber } = require("bignumber.js");
var router = require('express').Router();

// SPL TOKEN para USDC
const _SPL_TOKEN_USDC = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

const admin = require("firebase-admin");
const db = admin.firestore();

router.post("/generate", async (req, res) => {

  let wallet = req.body.wallet;
  let dateTime = req.body.date_time.split(' ');
  let amount = new BigNumber(parseFloat(req.body.amount));
  let label = req.body.label;
  let message = req.body.message;
  let memo = req.body.memo;

  let date = dateTime[0];
  let time = dateTime[1];

  let keypair = new Keypair();
  let publicKey = keypair.publicKey;
  let secretKey = keypair.secretKey;
  let reference = publicKey;

  let recipient = new PublicKey(wallet);

  let documentId = `${time}-${reference.toBase58().toString()}`;
  let collection = `${date}`;

  try {

    let url = encodeURL({ recipient, amount, splToken: _SPL_TOKEN_USDC, reference, label, message, memo });

    await db
      .collection(collection).doc(wallet).collection(collection).doc(`/${documentId}/`)
      .create({ url: url, amount: amount.toString(), label: label, message: message, memo: memo, wallet: wallet, secret_key: secretKey.toString(), confirmation_status: 'pending' });

    return res.status(200).send({ status: 1, url: url, secret_key: secretKey.toString(), document_id: documentId, collection: collection, memo: memo, wallet: wallet, message: message, amount: amount });

  } catch (error) {
    return res.status(500).send({ error: error });
  }
});


router.post("/check/:document_id", async (req, res) => {

  let documentId = req.params.document_id;

  let wallet = req.body.wallet;
  let collection = req.body.collection;
  let secretKey = req.body.secret_key;

  try {
    let keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey.split(',')));
    let reference = keypair.publicKey;

    let connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    let signatureInfo = await findTransactionSignature(connection, reference, undefined, 'confirmed');

    let document = db.collection(collection).doc(wallet).collection(collection).doc(documentId);
    document.update({ confirmation_status: "finalized", signature_info: signatureInfo });

    return res.status(200).send({ status: 1, signatureInfo });
  } catch (error) {
    return res.status(200).send({ status: 0, error: 'LA' });
  }
});


router.post("/to-list", async (req, res) => {

  let wallet = req.body.wallet;
  let collection = req.body.collection.split(' ')[0];

  try {
    let querySnapshot = await db.collection(collection).doc(wallet).collection(collection)
      .orderBy('memo', 'desc').get();
    let docs = querySnapshot.docs;
    
    const response = docs.map((doc) => ({
      document_id: doc.id,
      amount: doc.data().amount,
      label: doc.data().label,
      message: doc.data().message,
      memo: doc.data().memo,
      secret_key: doc.data().secret_key,
      confirmation_status: doc.data().confirmation_status,
      signature_info: doc.data().signature_info,
      wallet: doc.data().wallet,
      url: doc.data().url,
      collection: collection
    }));

    return res.status(200).json({ status: 1, l: response });
  } catch (error) {
    return res.status(500).json(error);
  }
});


const SPLToken = require('@solana/spl-token');

router.post("/balance", async (req, res) => {

  let wallet = req.body.wallet;

  try {
    let connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    let publicKey = new PublicKey(wallet);

    let balance = await connection.getBalance(publicKey);
    let sol = balance / LAMPORTS_PER_SOL;

    let response = await connection.getTokenAccountsByOwner(publicKey, { mint: _SPL_TOKEN_USDC });

    let usdc = 0.0;

    if (response.value.length > 0) {
      const accountInfo = SPLToken.AccountLayout.decode(response.value[0].account.data);
      usdc = parseFloat(accountInfo.amount) / 1000000;
    }
    return res.status(200).send({ status: 1, sol: sol, usdc: usdc });

  } catch (error) {
    return res.status(500).send({ error: error });
  }
});


module.exports = router;
