import "./widget.css";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SchoolIcon from '@mui/icons-material/School';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import ClassIcon from '@mui/icons-material/Class';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db, storage } from "../../firebase"
import { Link } from 'react-router-dom';

const Widget = ({ type }) => {
  const [userAmount, setUserAmount] = useState(0);
  const [classAmount, setClassAmount] = useState(0);

  let nullAmount = 0;
  let data;

  // Fetch user count from Firestore
  const fetchUserCount = async () => {
    try {
      let count = 0;
      const snapshot = await getDocs(collection(db, "users")); // Assuming your collection is named "users"
      
      // Check each document to count based on the role attribute
      snapshot.forEach(doc => {
        const userData = doc.data();
        if (type === "user" || (type === "student" && userData.role === "Student") || (type === "faculty" && userData.role === "Faculty")) {
          count++;
        }
      });
      
      setUserAmount(count);
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };

  // Fetch class count from Firestore
  const fetchClassCount = async () => {
    try {
      const snapshot = await getDocs(collection(db, "classes"));
      setClassAmount(snapshot.size);
    } catch (error) {
      console.error("Error fetching class count:", error);
    }
  };
  

  useEffect(() => {
    fetchUserCount();
    fetchClassCount();
  }, []); // Run once on component mount

  switch(type){
    case "user":
      data={
        title:"USERS",
        linkph:"See all users",
        link: "users",
        icon:(<PeopleAltIcon className="iconw"/>),
        amount: userAmount,
      };
      break;
    case "student":
      data={
        title:"STUDENTS",
        linkph:"See all students",
        icon:(<SchoolIcon className="iconw"/>),
        amount: userAmount,
      };
      break;
    case "faculty":
      data={
        title:"FACULTY",
        linkph:"See all faculty members",
        icon:(<SquareFootIcon className="iconw"/>),
        amount: userAmount,
      };
      break;
    case "course":
      data={
        title:"CLASSES",
        linkph:"See all classes",
        link: "classes",
        icon:(<ClassIcon className="iconw"/>),
        amount: classAmount,
      };
      break;
    case "accesspt":
      data={
        title:"ACCESSPOINTS",
        linkph:"See all access points",
        link: "accesspts",
        icon:(<RssFeedIcon className="iconw"/>),
        amount: nullAmount,
    };
    break;
    default:
    break;
  }
  
  return (
    <div className="widget">
      <div className="leftw">
        <span className="wtitle">{data.title}</span>
        <span className="counter">{data.amount}</span>
        <Link to={data.link}>
          <span className="linkw">{data.linkph}</span>
        </Link>
        
      </div>
      <div className="rightw">
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;