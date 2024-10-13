const admin = require('firebase-admin');
const serviceAccount = require('../config/serviceAccountKey.json'); // Adjust the path as needed

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // No need for databaseURL if only using Firestore
});

// Example function to delete a user
exports.deleteUser = functions.https.onRequest(async (req, res) => {
  const { userId } = req.body;

  try {
    await admin.auth().deleteUser(userId);
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error deleting user', error });
  }
});

// Export Firebase Admin services
const adminAuth = admin.auth();
const adminDb = admin.firestore();
