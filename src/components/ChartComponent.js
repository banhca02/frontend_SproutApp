import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ChartComponent = ({ title, data, color }) => (
  <div className="p-4 bg-white shadow rounded-lg">
    <h3 className="font-bold mb-2">{title}</h3>
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default ChartComponent;