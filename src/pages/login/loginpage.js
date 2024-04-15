import "./loginpage.css"
import { useContext, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import { type } from "@testing-library/user-event/dist/type";


const LoginPage = () => {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate()

  const {dispatch} = useContext(AuthContext)

  const handleLogin = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      dispatch({type:"LOGIN", payload:user})
      navigate("/")
      console.log("Logged In Succesfully!")
      console.log(user)
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