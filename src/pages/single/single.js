import "./single.css"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import Datatable from "../../components/datatable/Datatable";

const Single = () => {
  return(
    <div className="single">
        <Sidebar/>
        <div className="singleContainer">
          <Navbar/>
          <div className="tops">
            <div className="lefts">
              <div className="editButtons">Edit Account</div>
              <h1 className="titles">Information</h1>
              <div className="items">
                <img
                  src="https://img.game8.co/3619988/99ba4ee9abf0e4a88d54da22b63455ee.png/show"
                  className="itemImgs"
                />
                <div className="detailss">
                  <h1 className="itemTitles">Your Mom</h1>
                  <div className="detailItems">
                    <span className="itemKeys">ID Number:</span>
                    <span className="itemValues">0103-1019</span>
                  </div>
                  <div className="detailItems">
                    <span className="itemKeys">School Email:</span>
                    <span className="itemValues">knee.grow@cit.edu</span>
                  </div>
                  <div className="detailItems">
                    <span className="itemKeys">Role:</span>
                    <span className="itemValues">Student</span>
                  </div>
                </div>
              </div>
              <div className="deleteButtons">Delete Account</div>
            </div>
            <div className="rights">
              
              <form>
                <label for="courses">Course:</label>
                <select id="courses" name="courses">
                  <option value="CSIT111">CSIT111</option>
                  <option value="CSIT222">CSIT222</option>
                  <option value="CSIT333">CSIT333</option>
                  <option value="CSIT444">CSIT444</option>
                </select>
                <label for="status">Status:</label>
                <select id="status" name="courses">
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                </select>
                <input type="submit"/>
              </form>
              <Chart aspect={3/1} title="Attendance"/>
            </div>
          
          </div>

          <div className="bottom">
            {/* <Datatable title="Classes Attended"/> */}
            <p>Classes Attended table</p>
          </div>
        </div>
    </div>
  )
}

export default Single;