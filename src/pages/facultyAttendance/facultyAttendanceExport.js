import React, { useState, useEffect } from "react";
import { Modal, Box, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Close } from "@mui/icons-material";
import * as XLSX from "xlsx";

const FacultyAttendanceExport = ({ open, onClose, records, classes }) => {
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [semester, setSemester] = useState("");
  const [filteredSummary, setFilteredSummary] = useState([]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const schoolYears = Array.from(new Set(classes.map((cls) => cls.schoolYear)));
  const semesters = Array.from(new Set(classes.map((cls) => cls.semester)));

  const handleFilter = () => {
    let filteredRecords = [...records];

    // Filter by schoolYear and semester
    if (schoolYear && semester) {
      const validClassIds = classes
        .filter((cls) => cls.schoolYear === schoolYear && cls.semester === semester)
        .map((cls) => cls.id);

      filteredRecords = filteredRecords.filter((record) =>
        validClassIds.includes(record.classId)
      );
    }

    // Filter by startMonth and endMonth
    if (startMonth && endMonth) {
      const startIdx = months.indexOf(startMonth);
      const endIdx = months.indexOf(endMonth);

      filteredRecords = filteredRecords.filter((record) => {
        if (!record.rawDate) return false;

        const recordDate = new Date(record.rawDate);
        const recordMonth = recordDate.getMonth();

        return recordMonth >= startIdx && recordMonth <= endIdx;
      });
    }

    // Summarize records by faculty ID
    const summary = filteredRecords.reduce((acc, record) => {
      const { idNum, name, status } = record;

      if (!acc[idNum]) {
        acc[idNum] = { idNum, name, "On-Time": 0, Late: 0, Absent: 0 };
      }

      if (["On-Time", "Late", "Absent"].includes(status)) {
        acc[idNum][status] += 1;
      }

      return acc;
    }, {});

    setFilteredSummary(Object.values(summary));
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredSummary);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");

    XLSX.writeFile(workbook, "faculty_attendance_summary.xlsx");
  };

  useEffect(() => {
    if (!startMonth && !endMonth && !schoolYear && !semester) {
      const summary = records.reduce((acc, record) => {
        const { idNum, name, status } = record;

        if (!acc[idNum]) {
          acc[idNum] = { idNum, name, "On-Time": 0, Late: 0, Absent: 0 };
        }

        if (["On-Time", "Late", "Absent"].includes(status)) {
          acc[idNum][status] += 1;
        }

        return acc;
      }, {});

      setFilteredSummary(Object.values(summary));
    }
  }, [records, startMonth, endMonth, schoolYear, semester]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Export Faculty Attendance</h2>
          <Button onClick={onClose}>
            <Close />
          </Button>
        </div>

        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <FormControl variant="outlined" style={{ minWidth: 150 }}>
            <InputLabel>Start Month</InputLabel>
            <Select
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              label="Start Month"
            >
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 150 }}>
            <InputLabel>End Month</InputLabel>
            <Select
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              label="End Month"
            >
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 150 }}>
            <InputLabel>School Year</InputLabel>
            <Select
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              label="School Year"
            >
              {schoolYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 150 }}>
            <InputLabel>Semester</InputLabel>
            <Select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              label="Semester"
            >
              {semesters.map((sem) => (
                <MenuItem key={sem} value={sem}>
                  {sem}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleFilter}>
            Filter
          </Button>
        </div>

        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={filteredSummary}
            getRowId={(row) => row.idNum} // Ensure unique IDs based on `idNum`
            columns={[
              { field: "idNum", headerName: "ID Number", width: 150 },
              { field: "name", headerName: "Name", width: 200 },
              { field: "On-Time", headerName: "On-Time", width: 120 },
              { field: "Late", headerName: "Late", width: 120 },
              { field: "Absent", headerName: "Absent", width: 120 },
            ]}
            pageSize={5}
            disableSelectionOnClick
          />
        </div>

        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <Button variant="contained" color="primary" onClick={exportToExcel}>
            Export to Excel
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default FacultyAttendanceExport;
