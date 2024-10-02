import "./chart.css";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Chart = ({ aspect, title, data, selectedClassID, onClassSelect, attendanceData }) => {
  console.log("Classes for dropdown:", data);
  console.log("Selected classID:", selectedClassID);

  // Prepare the dropdown options
  const classOptions = data.map(classData => (
    <option key={classData.classID} value={classData.classID}>
      {`${classData.classCode} (${classData.classSec}) - ${classData.classType}`}
    </option>
  ));

  // Prepare chart data for the selected classID
  const selectedClassData = attendanceData.find(item => item.classID === selectedClassID);

  const chartData = selectedClassData
    ? selectedClassData.records.map(record => ({
        timeIn: record.timeIn, // Use formatted timeIn
        status: record.status,
      }))
    : [];

  return (
    <div className="chart">
      <div className="titlec">{title}</div>

      {/* Form for selecting the course */}
      <form>
        <label htmlFor="courses">Course:</label>
        <select
          id="courses"
          name="courses"
          value={selectedClassID}
          onChange={(e) => onClassSelect(e.target.value)}
        >
          {classOptions}
        </select>
      </form>

      <ResponsiveContainer width="100%" aspect={aspect}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="status" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="maroon" stopOpacity={0.8} />
              <stop offset="95%" stopColor="maroon" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="timeIn" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" className="chartGrid" />
          <Tooltip />
          <Area type="monotone" dataKey="timeIn" stroke="#8884d8" fillOpacity={1} fill="url(#status)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
