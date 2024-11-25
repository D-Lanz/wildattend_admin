import React, { useState, useEffect } from "react";
import { Modal, Box, FormControl, InputLabel, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

const FacultyAttendanceExport = ({ open, onClose, records, classes }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredSummary, setFilteredSummary] = useState([]);

  const getScheduledDates = (days, startDate, endDate) => {
    const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    const activeDays = Object.keys(days || {}).filter((day) => days[day]);

    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (activeDays.some((day) => dayMap[day] === currentDate.getDay())) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const processAttendanceData = (expectedDates, attendanceSnapshot, counts, startTime, endTime) => {
    const attendanceByDate = new Map();
    const currentDate = new Date();

    attendanceSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const dateKey = data.timeIn?.toDate().toDateString();
      attendanceByDate.set(dateKey, {
        id: doc.id,
        timeIn: data.timeIn ? data.timeIn.toDate() : null,
        status: data.status,
      });
    });

    expectedDates.forEach((date) => {
      const dateString = date.toDateString();

      const classEndDateTime = new Date(date);
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      classEndDateTime.setHours(endHours, endMinutes, 0, 0);

      const record = attendanceByDate.get(dateString);

      if (record) {
        const timeIn = record.timeIn;
        if (timeIn && timeIn <= classEndDateTime) {
          counts["On-Time"] += 1;
        } else {
          counts["Late"] += 1;
        }
      } else if (currentDate >= classEndDateTime) {
        counts["Absent"] += 1;
      }
    });
  };

  const calculateOverallSummary = async () => {
    const counts = {};

    for (const classItem of classes) {
      const { id: classId, days, startTime, endTime } = classItem;

      const userClassQuery = query(
        collection(db, "userClasses"),
        where("classID", "==", classId)
      );
      const userClassSnapshot = await getDocs(userClassQuery);

      for (const docSnap of userClassSnapshot.docs) {
        const userClassData = docSnap.data();
        const userId = userClassData.userID;
        const enrollDate = userClassData.enrollDate?.toDate();

        if (!days || !enrollDate) continue;

        const classStartDate = new Date(enrollDate);
        const currentDate = new Date();
        const expectedDates = getScheduledDates(days, classStartDate, currentDate);

        const attendanceQuery = query(
          collection(db, "attendRecord"),
          where("userId", "==", userId),
          where("classId", "==", classId),
          orderBy("timeIn", "desc")
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);

        if (!counts[userId]) {
          counts[userId] = { idNum: userId, name: userClassData.userName, "On-Time": 0, Late: 0, Absent: 0 };
        }

        const userCounts = { "On-Time": 0, Late: 0, Absent: 0 };
        processAttendanceData(expectedDates, attendanceSnapshot, userCounts, startTime, endTime);

        counts[userId]["On-Time"] += userCounts["On-Time"];
        counts[userId]["Late"] += userCounts["Late"];
        counts[userId]["Absent"] += userCounts["Absent"];
      }
    }

    setFilteredSummary(Object.values(counts));
  };

  const handleFilter = () => {
    let filteredRecords = [...records];

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      filteredRecords = filteredRecords.filter((record) => {
        if (!record.rawDate) return false;

        const recordDate = new Date(record.rawDate);
        return recordDate >= start && recordDate <= end;
      });
    }

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
    if (!startDate && !endDate) {
      calculateOverallSummary();
    }
  }, [classes, startDate, endDate]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "45%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Export Faculty Attendance</h2>
          <div className="customButton" onClick={onClose}>
            Close
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <FormControl variant="outlined" style={{ flex: 1 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </FormControl>
          <FormControl variant="outlined" style={{ flex: 1 }}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </FormControl>
          <div className="customButton" onClick={handleFilter}>
            Filter
          </div>
        </div>

        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={filteredSummary}
            getRowId={(row) => row.idNum}
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
          <div className="customButton" onClick={exportToExcel}>
            Export to Excel
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default FacultyAttendanceExport;
