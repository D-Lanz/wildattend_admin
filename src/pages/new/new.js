import "./new.css"
import { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore"; 
import { auth, db, storage } from "../../firebase"
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const New = ({inputs, title}) => {
  const [file,setFile] = useState("");
  const [data,setData] = useState({});
  const [perc,setPerc] = useState(null);

  useEffect(()=>{
    const uploadFile = () => {
      const name = new Date().getTime() + file.name
      console.log(name)

      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Register three observers:
      // 1. 'state_changed' observer, called any time the state changes
      // 2. Error observer, called on failure
      // 3. Completion observer, called on successful completion
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          setPerc(progress);
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
              default:
                break;
          }
        }, 
        (error) => {
          // Handle unsuccessful uploads
          console.log(error)
        }, 
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setData((prev)=>({...prev, img:downloadURL}))
          });
        }
      );
    };
    file && uploadFile();
  },[file]);

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;
 
    setData({...data, [id]: value})
  }

  
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
              <button disabled={perc !== null && perc < 100} className="buttonn" type="submit">Submit</button>
            </form>
          </div>
        </div>
        </div>
    </div>
  )
}

export default New;