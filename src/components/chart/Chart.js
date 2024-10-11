import "./chart.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Chart = ({ aspect, title }) => {
  // Static data for the pie chart
  const pieChartData = [
    { name: 'On-Time', value: 21, color: '#0088FE' },  // Changed color to represent each section
    { name: 'Late', value: 5, color: '#FFBB28' },
    { name: 'Absent', value: 3, color: '#FF8042' },
  ];

  return (
    <div className="chart">
      <div className="titlec">{title}</div>

      <ResponsiveContainer width="100%" aspect={aspect}>
        <PieChart>
          <Tooltip />
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            outerRadius={60}
            dataKey="value"
          >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="attendance-labels">
        {pieChartData.map((entry, index) => (
          <div key={index} className="attendance-label" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chart;
