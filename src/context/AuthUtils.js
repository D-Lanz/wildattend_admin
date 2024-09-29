// Import necessary functions from Firebase Auth module
import { getAuth, deleteUser as deleteAuthUser } from "firebase/auth";
import { getUser } from "firebase/auth"; // Ensure this import is valid based on your Firebase SDK version

// Initialize Firebase Auth
const auth = getAuth();

// Function to delete user from Firebase Authentication
const deleteUser = async (user) => {
  try {
    await deleteAuthUser(auth, user.uid);
    console.log("User deleted successfully from Firebase Authentication.");
  } catch (error) {
    console.error("Error deleting user from Firebase Authentication:", error);
    throw error; // Optionally re-throw the error for handling in the calling function
  }
};

// Function to get user by UID
const getUserById = async (userId) => {
  try {
    const user = await auth.getUser(auth, userId);
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Export the functions correctly
export { getUserById, deleteUser }; // Ensure proper export syntax
