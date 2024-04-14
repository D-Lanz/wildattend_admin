import "./loginpage.css"
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";


const AdminDashboard = () => {
  return(
    <div>
      <h1>Welcome Admin!</h1>
    </div>
  )
}

export default AdminDashboard