import "./loginpage.css"
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";


const LoginPage = () => {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
      console.log(user)
      navigate("/")
      // ...
    })
    .catch((error) => {
      setError(true);
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
  }

  return(
    <div>
      <h1>Login</h1>
      <div className="login">
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="email" onChange={e=>setEmail(e.target.value)}/>
          <input type="password" placeholder="password" onChange={e=>setPassword(e.target.value)}/>
          <button type="submit">Login</button>
          {error && <span>Wrong email or password!</span>}
        </form>
      </div>
    </div>
  )
}

export default LoginPage