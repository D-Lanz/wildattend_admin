import "./widget.css";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SchoolIcon from '@mui/icons-material/School';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import ClassIcon from '@mui/icons-material/Class';
import RssFeedIcon from '@mui/icons-material/RssFeed';

const Widget = ({type}) => {
  let data;

  //tempo
  const amount = 100

  switch(type){
    case "user":
      data={
        title:"USERS",
        link:"See all users",
        icon:(<PeopleAltIcon className="iconw"/>),
      };
      break;
    case "student":
      data={
        title:"STUDENTS",
        link:"See all students",
        icon:(<SchoolIcon className="iconw"/>),
      };
      break;
    case "faculty":
      data={
        title:"FACULTY",
        link:"See all faculty members",
        icon:(<SquareFootIcon className="iconw"/>),
      };
      break;
    case "course":
      data={
        title:"COURSES",
        link:"See all courses",
        icon:(<ClassIcon className="iconw"/>),
      };
      break;
    case "accesspt":
      data={
        title:"ACCESSPOINTS",
        link:"See all access points",
        icon:(<RssFeedIcon className="iconw"/>),
    };
    break;
  default:
    break;
}


  return (
    <div className="widget">
      <div className="leftw">
        <span className="wtitle">{data.title}</span>
        <span className="counter">{amount}</span>
        <span className="linkw">{data.link}</span>
      </div>
      <div className="rightw">
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;