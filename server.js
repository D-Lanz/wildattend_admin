const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

admin.initializeApp(); // Initialize Firebase

const db = admin.firestore();

// Helper function to get today's weekday name
const getWeekdayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  return days[today.getDay()];
};

// Function to check and mark absences
const markAbsences = async () => {
  const weekday = getWeekdayName();

  try {
    // Step 1: Fetch all classes scheduled for today
    const classesSnapshot = await db.collection('classes')
      .where(`days.${weekday}`, '==', true)
      .get();

    // Step 2: Process each class scheduled for today
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const { startTime, endTime } = classData;
      const classID = classDoc.id;

      // Step 3: Get all users enrolled in this class
      const userClassesSnapshot = await db.collection('userClasses')
        .where('classID', '==', classID)
        .get();

      const todayDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

      // Step 4: Check attendance for each enrolled user
      for (const userClassDoc of userClassesSnapshot.docs) {
        const userID = userClassDoc.data().userID;

        // Step 5: Check if an attendRecord exists for this user, class, and today's date
        const attendanceSnapshot = await db.collection('attendRecord')
          .where('userId', '==', userID)
          .where('classId', '==', classID)
          .where('timeIn', '>=', new Date(`${todayDate}T00:00:00`))
          .where('timeIn', '<', new Date(`${todayDate}T23:59:59`))
          .get();

        // Step 6: If no attendance record exists, mark as absent
        if (attendanceSnapshot.empty) {
          await db.collection('attendRecord').add({
            userId: userID,
            classId: classID,
            status: 'Absent',
            timeIn: null,
            timeOut: null,
            date: todayDate,
          });
          console.log(`Marked user ${userID} as Absent for class ${classID} on ${todayDate}`);
        }
      }
    }
  } catch (error) {
    console.error('Error marking absences:', error);
  }
};

// Schedule the task to run daily at midnight (or any preferred time)
cron.schedule('0 0 * * *', () => {
  console.log('Running daily absence check...');
  markAbsences();
});

app.post('/deleteUser', async (req, res) => {
  const { userId } = req.body;

  try {
    await admin.auth().deleteUser(userId);
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ message: 'Error deleting user', error });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
