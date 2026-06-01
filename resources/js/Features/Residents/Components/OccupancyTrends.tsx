import Card from '@/Components/ui/Card/Card';
import { YAxis, CartesianGrid } from "recharts";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    Tooltip,
} from 'recharts';

const data = [
    { month: 'Jan', occupied: 360 },
    { month: 'Feb', occupied: 370 },
    { month: 'Mar', occupied: 378 },
    { month: 'Apr', occupied: 384 },
    { month: 'May', occupied: 395 },
];

export default function OccupancyTrends() {
    return (
        <Card className="p-6 h-[300px]">

            <h3 className="font-semibold mb-6">
                Occupancy Trends
            </h3>

            <ResponsiveContainer
                width="100%"
                height={220}
            >
               <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="occupied"
                    strokeWidth={3}
                />
            </LineChart>

            </ResponsiveContainer>

        </Card>
    );
}
