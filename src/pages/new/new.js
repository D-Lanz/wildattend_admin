import "./new.css"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

const New = () => {
  return(
    <div className="new">
        <Sidebar/>
        <div className="newContainer">
        <Navbar/>
        <div className="topn">
          <h2 className="titlen">Add New User</h2>
        </div>
        <div className="bottomn">
          <div className="leftn">
            <img
              src="https://img.game8.co/3619988/99ba4ee9abf0e4a88d54da22b63455ee.png/show"
              className="newImg"
            />
          </div>
          <div className="rightn">
            <form>
              <div class="formInput">
                <label for="idNum">ID Number:</label>
                <input type="text" id="idNum" placeholder="00-0000-000" pattern="[0-9]{2}-[0-9]{4}-[0-9]{3}" required title="Please enter a valid ID number in the format 00-0000-000"/>
              </div>
              <div className="formInput">
                <label for="firstName">First Name:</label>
                <input type="text" placeholder="First Name" required/>
              </div>
              <div className="formInput">
                <label for="lastName">Last Name:</label>
                <input type="text" placeholder="Last Name" required/>
              </div>
              <div className="formInput">
                <label for="email">School Email:</label>
                <input type="email" placeholder="School Email" required/>
              </div>
              <div className="formInput">
                <label for="program">Program:</label>
                <input type="text" placeholder="Program" required/>
              </div>
              <div className="formInput">
                <label for="role">Role:</label>
                <select id="role" name="role">
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                </select>
              </div>
              <div className="formInput">
                <label>Password:</label>
                <input type="password" placeholder="*****"/>
              </div>
              <button>Create New Account</button>
            </form>
          </div>
        </div>
        </div>
    </div>
  )
}

export default New;