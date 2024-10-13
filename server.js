const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json'); // Adjust the path as needed

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Create an Express app
const app = express();
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

// Start the server
const PORT = process.env.PORT || 3000; // Use port 5000 or environment-defined port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
