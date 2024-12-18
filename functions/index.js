const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// Firebase Admin initialization
admin.initializeApp();


// Express app setup
const app = express();
app.use(cors({origin: true})); // Allow all origins for Firebase Functions
app.use(express.json());

// Routes
app.post("/deleteUser", async (req, res) => {
  const {userId} = req.body;

  try {
    await admin.auth().deleteUser(userId);
    res.status(200).send({message: "User deleted successfully"});
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({message: "Error deleting user", error: error.message});
  }
});

// Export Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);
