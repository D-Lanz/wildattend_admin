import { useState, useEffect, useContext } from "react";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import { AuthContext } from "../../context/AuthContext"; // Update this path if needed
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase"; // Import db and storage from firebase
import "./admin_profile.css";

const AdminProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [profilePic, setProfilePic] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        try {
          const userDoc = doc(db, "users", currentUser.uid); // Replace "users" with your collection name
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            const profileData = docSnap.data();
            setProfile(profileData);
            if (profileData.img) {
              // Fetch the profile image from Firebase Storage
              const imgRef = ref(storage, profileData.img);
              const url = await getDownloadURL(imgRef);
              setProfilePic(url);
            }
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching profile: ", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [currentUser]);

  return (
    <div className="profile">
      <Sidebar />
      <div className="profileContainer">
        <Navbar />
        {loading ? (
          <div className="loading">Loading...</div>
        ) : profile ? (
          <div className="profileDetails">
            <div className="profilePicContainer">
              <img src={profilePic} alt="Profile" className="profilePic" />
            </div>
            <h1>{profile.lastName}, {profile.firstName} ({profile.idNum})</h1>
            <p>Email: {profile.email}</p>
            <p>Role: {profile.role}</p>
            {/* Display other profile information here */}
          </div>
        ) : (
          <p>No profile data found</p>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
