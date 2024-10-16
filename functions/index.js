/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const serviceAccount = require('./config/serviceAccountKey.json'); // Adjust the path as needed

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Create an Express app
const app = express();

// Enable CORS for any frontend domain (e.g., replace localhost with your domain when deployed)
app.use(cors({ origin: true })); // Allow any origin for now; restrict to specific domains after deployment

app.use(bodyParser.json()); // Middleware to parse JSON request bodies

// Define the route for deleting a user
app.post('/deleteUser', async (req, res) => {
  const { userId } = req.body;

  try {
    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(userId);
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ message: 'Error deleting user', error });
  }
});

// Export the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);