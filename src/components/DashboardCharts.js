import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const tempData = [
    { time: "00:00", value: 22 },
    { time: "06:00", value: 24 },
    { time: "12:00", value: 28 },
    { time: "18:00", value: 26 },
    { time: "23:59", value: 22 },
];

const lightData = [
    { time: "00:00", value: 1000 },
    { time: "06:00", value: 20000 },
    { time: "12:00", value: 60000 },
    { time: "18:00", value: 15000 },
    { time: "23:59", value: 1000 },
];

const humidityData = [
    { time: "00:00", value: 80 },
    { time: "06:00", value: 70 },
    { time: "12:00", value: 60 },
    { time: "18:00", value: 65 },
    { time: "23:59", value: 75 },
];

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

const DashboardCharts = () => (
    <div className="grid grid-cols-2 gap-6">
        <ChartComponent title="Biểu đồ nhiệt độ" data={tempData} color="#ff7300" />
        <ChartComponent title="Biểu đồ ánh sáng" data={lightData} color="#fdd835" />
        <ChartComponent title="Biểu đồ độ ẩm" data={humidityData} color="#2196f3" />
    </div>
);

export default DashboardCharts;
