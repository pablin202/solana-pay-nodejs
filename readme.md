# Solana Blockchain Transactions App

This Node.js application is designed to facilitate transactions on the Solana blockchain. It is intended to be deployed as a Firebase Functions project and provides four endpoints to perform various blockchain-related tasks. Before getting started, make sure you follow the initial setup instructions.

## Initial Setup

1. Create a Firebase project.
2. Download the JSON file containing your project's private key.
3. Rename the downloaded file to 'credential.json'.
4. Place 'credential.json' in the 'functions' folder of this project.

## Endpoints

### 1. Generate QR Code for Solana Payment

This endpoint generates a QR code for a specified USDC payment on the Solana network.

**Endpoint:** `/generate` (POST)

**Request Body:**
```json
{
  "wallet": "Solana wallet address",
  "date_time": "Date and time",
  "amount": "Payment amount in USDC",
  "label": "Label for the payment",
  "message": "Additional message",
  "memo": "Transaction memo"
}
```

### 2. Check Solana Transaction Status

This endpoint checks the status of a Solana blockchain transaction using the `@solana/pay` library.

**Endpoint:** `/check/:documentId` (POST)

**Request Body:**
```json
{
  "wallet": "Solana wallet address",
  "collection": "Collection name",
  "secret_key": "Secret key for transaction"
}
```

### 3. List Recorded Transactions

This endpoint retrieves transactions recorded in Firebase Datastore for a specific wallet, grouped by day.

**Endpoint:** `/list` (POST)

**Request Body:**
```json
{
  "wallet": "Solana wallet address"
}
```

### 4. Get Wallet Balance

This endpoint fetches the balance of a Solana wallet using the `@solana/web3.js` library.

**Endpoint:** `/balance` (POST)

**Request Body:**
```json
{
  "wallet": "Solana wallet address"
}
```

## Deployment

To deploy this Node.js application with Firebase Functions, follow these steps:

1. Install Firebase CLI globally: `npm install -g firebase-tools`
2. Log in to Firebase: `firebase login`
3. Initialize Firebase in your project folder: `firebase init functions`
4. Deploy the project: `firebase deploy --only functions`

Your Solana blockchain transactions app will be up and running on Firebase Functions, ready to serve your blockchain-related needs.

Feel free to modify and extend this application as needed for your specific use case. Happy coding!