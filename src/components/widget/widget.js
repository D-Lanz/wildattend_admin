import "./widget.css";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

const Widget = () => {

  return (
    <div className="widget">
      <div className="leftw">
        <span className="wtitle">USERS</span>
        <span className="counter">1234</span>
        <span className="linkw">See all users</span>
      </div>
      <div className="rightw">
        <div className="percentage">
          <KeyboardArrowUpIcon/>
          20%
        </div>
        <PersonOutlinedIcon className="icon"/>
      </div>
    </div>
  );
};

export default Widget;