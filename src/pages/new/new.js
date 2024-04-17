import "./new.css"
import { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';

const New = ({inputs, title}) => {

  const [file,setFile] = useState("");
  console.log(file);

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
            <form className="formn">
              <div class="formInput">
                <label className="labeln" for="imgUpload" htmlFor="file">
                  Image: <DriveFolderUploadIcon className="iconn"/>
                </label>
                <input className="inputn" onChange={e=>setFile(e.target.files[0])} type="file" id="file" style={{display:"none"}}/>
              </div>

              {inputs.map((input)=>(
              <div class="formInput" key={input.id}>
                <label className="labeln" for="idNum">{input.label}</label>
                <input className="inputn" type={input.type} placeholder={input.placeholder} pattern={input.pattern} required/>
              </div>
              ))}
              <button className="buttonn">Create New Account</button>
            </form>
          </div>
        </div>
        </div>
    </div>
  )
}

export default New;