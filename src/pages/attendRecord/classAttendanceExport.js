import React, { useState, useEffect } from "react";
import { Modal, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

const ClassAttendanceExportModal = ({ open, onClose, attendanceData, classDetails }) => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const calculateSummary = async () => {
      if (!classDetails) {
        console.warn("classDetails is missing or null.");
        setLoading(false);
        return;
      }

      setLoading(true);
      const counts = {};
      const currentDate = new Date();

      const fetchUserDetails = async (userId) => {
        try {
          const userDoc = await getDocs(
            query(collection(db, "users"), where("__name__", "==", userId))
          );
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            return {
              lastName: userData.lastName || "Unknown",
              firstName: userData.firstName || "Unknown",
              role: userData.role || "Unknown",
            };
          }
        } catch (error) {
          console.error("Error fetching user details for userID:", userId, error);
        }
        return { lastName: "Unknown", firstName: "Unknown", role: "Unknown" };
      };

      const processClass = async (classItemId, classItemData) => {
        const { days, startTime, endTime } = classItemData;

        if (!classItemId || !days || !startTime || !endTime) {
          console.error("Invalid classItem or missing required fields:", {
            classItemId,
            days,
            startTime,
            endTime,
          });
          return;
        }

        try {
          const userClassQuery = query(
            collection(db, "userClasses"),
            where("classID", "==", classItemId)
          );
          const userClassSnapshot = await getDocs(userClassQuery);

          for (const docSnap of userClassSnapshot.docs) {
            const userClassData = docSnap.data();
            const userId = userClassData.userID;
            const enrollDate = userClassData.enrollDate?.toDate();

            if (!userId || !enrollDate) {
              console.warn("Missing userID or enrollDate for userClassData:", userClassData);
              continue;
            }

            const classStartDate = new Date(enrollDate);
            const expectedDates = getScheduledDates(days, classStartDate, currentDate);

            const attendanceQuery = query(
              collection(db, "attendRecord"),
              where("userId", "==", userId),
              where("classId", "==", classItemId),
              orderBy("timeIn", "desc")
            );
            const attendanceSnapshot = await getDocs(attendanceQuery);

            if (!counts[userId]) {
              const { lastName, firstName, role } = await fetchUserDetails(userId);

              // Skip users with "Unknown" names
              if (lastName === "Unknown" || firstName === "Unknown") {
                continue;
              }

              counts[userId] = {
                idNum: userId,
                name: `${lastName}, ${firstName}`,
                role,
                "On-Time": 0,
                Late: 0,
                Absent: 0,
              };
            }

            const userCounts = { "On-Time": 0, Late: 0, Absent: 0 };
            processAttendanceData(expectedDates, attendanceSnapshot, userCounts, startTime, endTime);

            counts[userId]["On-Time"] += userCounts["On-Time"];
            counts[userId]["Late"] += userCounts["Late"];
            counts[userId]["Absent"] += userCounts["Absent"];
          }
        } catch (error) {
          console.error("Error processing class:", error);
        }
      };

      try {
        if (classDetails === "all") {
          await Promise.all(
            attendanceData.map(({ id, ...data }) => processClass(id, data))
          );
        } else {
          const classId = classDetails.id || classDetails.documentId || null;
          if (!classId) {
            console.error("Invalid classDetails without an ID:", classDetails);
            setLoading(false);
            return;
          }
          await processClass(classId, classDetails);
        }
      } catch (error) {
        console.error("Error calculating summary:", error);
      } finally {
        setSummary(
          Object.values(counts)
            .filter((user) => user.role !== "Admin") // Exclude Admin users
            .sort((a, b) => {
              if (a.role === "Faculty" && b.role !== "Faculty") return -1;
              if (a.role !== "Faculty" && b.role === "Faculty") return 1;
              return a.name.localeCompare(b.name);
            })
            .map((user, index) => ({ ...user, num: index + 1 })) // Add a numbering column
        );
        setLoading(false);
      }
    };

    if (open) {
      calculateSummary();
    }
  }, [open, classDetails]);

  const exportToExcel = () => {
    const exportData = summary.map(({ num, name, "On-Time": onTime, Late: late, Absent: absent }) => ({
      "#": num,
      "Name (lastname, firstname)": name,
      "On-Time": onTime,
      "Late": late,
      "Absent": absent,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Summary");

    const fileName = `Attendance_Summary.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "50%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Export Attendance Summary</h2>
          <div className="customButton" onClick={onClose}>
            Close
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", margin: "20px 0" }}>Loading...</div>
        ) : (
          <>
            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={summary}
                getRowId={(row) => row.idNum}
                columns={[
                  { field: "num", headerName: "#", width: 50 }, // Stable numbering column
                  { field: "name", headerName: "Name (lastname, firstname)", width: 250 },
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
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ClassAttendanceExportModal;
