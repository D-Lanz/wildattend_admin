import "./new.css"
import { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore"; 
import { auth, db } from "../../firebase"
import { createUserWithEmailAndPassword } from "firebase/auth";

const New = ({inputs, title}) => {

  const [file,setFile] = useState("");
  const [data,setData] = useState({});

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;

    setData({...data, [id]: value})
  }

  console.log(data)

  const handleAdd = async (e) => {
    e.preventDefault()
    try{
      const res = await createUserWithEmailAndPassword (
        auth,
        data.email,
        data.password
      );
      await setDoc(doc(db, "users", res.user.uid), {
        ...data,
        timeStamp: serverTimestamp()
      });
    }catch(err){
      console.log(err)
    }
  }

  return(
    <div className="new">
        <Sidebar/>
        <div className="newContainer">
        <Navbar/>
        <div className="topn">
          <h2 className="titlen">{title}</h2>
        </div>
        <div className="bottomn">
          <div className="leftn">
            <img
              src={ 
                file ? URL.createObjectURL(file)
                : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"}
              className="newImg"
            />
          </div>
          <div className="rightn">
            <form className="formn" onSubmit={handleAdd}>
              <div className="formInput">
                <label className="labeln" for="imgUpload" htmlFor="file">
                  Image: <DriveFolderUploadIcon className="iconn"/>
                </label>
                <input className="inputn" onChange={e=>setFile(e.target.files[0])} type="file" id="file" style={{display:"none"}}/>
              </div>

              {inputs.map((input)=>(
              <div className="formInput" key={input.id}>
                <label className="labeln" for="idNum">{input.label}</label>
                <input className="inputn"
                  id={input.id}
                  type={input.type}
                  placeholder={input.placeholder}
                  pattern={input.pattern}
                  onChange={handleInput}/>
              </div>
              ))}
              <button className="buttonn" type="submit">Submit</button>
            </form>
          </div>
        </div>
        </div>
    </div>
  )
}

export default New;