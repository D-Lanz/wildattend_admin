import "./chart.css";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { Month: "February", Total: 24 },
  { Month: "March", Total: 31 },
  { Month: "April", Total: 30 },
  { Month: "May", Total: 31 },
];

const Chart = ({aspect, title}) => {
  return (
    <div className="chart">
      <div className="titlec">{title}</div>
      <form>
        <label htmlFor="courses">Course:</label>
        <select id="courses" name="courses">
          <option value="CSIT111">CSIT111</option>
          <option value="CSIT222">CSIT222</option>
          <option value="CSIT333">CSIT333</option>
          <option value="CSIT444">CSIT444</option>
        </select>
        <label htmlFor="status">Status:</label>
        <select id="status" name="courses">
          <option value="Present">Present</option>
          <option value="Late">Late</option>
          <option value="Absent">Absent</option>
        </select>
        <input type="submit" />
      </form>


      <ResponsiveContainer width="100%" aspect={aspect}>
        <AreaChart width={730} height={250} data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="maroon" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="maroon" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="Month" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" className="chartGrid"/>
        <Tooltip />
        <Area type="monotone" dataKey="Total" stroke="#8884d8" fillOpacity={1} fill="url(#total)" />
      </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Chart