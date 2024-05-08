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

export const roomColumns = [
  { field: 'building', headerName: 'Building', width: 120, },
  { field: 'roomNum', headerName: 'Room No.', width: 120, },
  { field: 'location', headerName: 'Location', width: 220, },
  { field: 'capacity', headerName: 'Capacity', width: 120, },
  { field: 'occupancyStatus', headerName: 'Status', width: 220, },
];

export const accessPointColumns = [
  { field: 'macAddress', headerName: 'MAC Address', width: 320, },
  { field: 'location', headerName: 'Location', width: 320, },
  { field: 'signalStr', headerName: 'Signal Strength', width: 120, },
  { field: 'status', headerName: 'Status', width: 220, },
];