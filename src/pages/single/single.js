import "./single.css"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

const Single = () => {
  return(
    <div className="single">
        <Sidebar/>
        <div className="singleContainer">
          <Navbar/>
          <div className="left">
            <h1 className="title">Information</h1>
            <div className="item">
              <img
                src="https://img.game8.co/3619988/99ba4ee9abf0e4a88d54da22b63455ee.png/show"
                alt=""
                className="itemImg"/>
            </div>
          </div>
          <div className="right">

          </div>
          <div className="bottom">

          </div>
        </div>
    </div>
  )
}

export default Single;