import React, { useState, useEffect } from "react";
import { Modal, Box, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Close } from "@mui/icons-material";
import * as XLSX from "xlsx";

const ClassAttendanceExportModal = ({ open, onClose, attendanceData, classDetails }) => {
  const [summary, setSummary] = useState([]);

  const getScheduledDates = (days, startDate, endDate) => {
    const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    const activeDays = Object.keys(days).filter(day => days[day]);

    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (activeDays.some(day => dayMap[day] === currentDate.getDay())) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const calculateOverallSummary = () => {
    if (!classDetails || !attendanceData) return;

    const { days, startTime, endTime, startDate, endDate } = classDetails;
    const scheduledDates = getScheduledDates(days, new Date(startDate), new Date(endDate));

    const overallSummary = [...attendanceData.faculty, ...attendanceData.students].reduce(
      (acc, user) => {
        const { id, lastName, firstName, status, rawDate } = user;

        // Initialize user summary
        if (!acc[id]) {
          acc[id] = { 
            id, 
            name: `${lastName}, ${firstName}`, 
            "On-Time": 0, 
            Late: 0, 
            Absent: 0 
          };
        }

        // Update status counts
        if (["On-Time", "Late"].includes(status)) {
          acc[id][status] += 1;
        }

        return acc;
      },
      {}
    );

    // Calculate absences
    Object.keys(overallSummary).forEach((id) => {
      const userRecords = attendanceData.faculty.concat(attendanceData.students).filter((record) => record.id === id);
      const attendedDates = new Set(userRecords.map((record) => new Date(record.rawDate).toDateString()));

      const absences = scheduledDates.filter(
        (date) => !attendedDates.has(date.toDateString())
      );

      overallSummary[id].Absent = absences.length;
    });

    setSummary(Object.values(overallSummary));
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(summary);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Class Attendance Summary");

    const fileName = `${classDetails.classCode}_${classDetails.schoolYear}_Attendance_Summary.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    if (open) {
      calculateOverallSummary();
    }
  }, [attendanceData, open]);

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
          <h2>Export Class Attendance Summary</h2>
          <Button onClick={onClose}>
            <Close />
          </Button>
        </div>

        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={summary}
            getRowId={(row) => row.id} // Ensure unique IDs based on `id`
            columns={[
              { field: "id", headerName: "ID", width: 150 },
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

export default ClassAttendanceExportModal;
