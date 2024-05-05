export const userColumns = [
  { field: 'idNum', headerName: 'ID Number', width: 130, },
    {
      field: 'user', headerName: 'User', width: 230, renderCell:(params)=>{
        return(
          <div className="cellWithImg">
            <img className="cellImg" src={params.row.img} alt="avatar"/>
            {params.row.lastName}, {params.row.firstName}
          </div>
        );
    },
  },
  { field: 'email', headerName: 'School Email', width: 230, },
  { field: 'role', headerName: 'Role', width: 130, },
];

export const classColumns = [
  { field: 'classCode', headerName: 'ClassCode', width: 100, },
  {
    field: 'class', headerName: 'Class', width: 230, renderCell:(params)=>{
      return(
        <div className="cellWithImg">
          <img className="cellImg" src={params.row.img} alt="avatar"/>
          {params.row.classDesc}
        </div>
      );
    },
  },
  { field: 'classSec', headerName: 'Section', width: 100, },
  { field: 'instructor', headerName: 'Instructor', width: 150, },
  { field: 'classRoom', headerName: 'Classroom', width: 100, },
  { field: 'semester', headerName: 'Semester', width: 100, },
  { field: 'schoolYear', headerName: 'School Year', width: 100, },
];

export const userClassColumns = [
  { field: 'status', headerName: 'Status', width: 100, },
  { field: 'timeIn', headerName: 'Time In', width: 420, },
  { field: 'timeOut', headerName: 'Time Out', width: 420, },
];