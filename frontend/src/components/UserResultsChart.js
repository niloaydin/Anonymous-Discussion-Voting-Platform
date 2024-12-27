import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const UserResultsChart = ({ results }) => {
    const data = results.map((result) => ({
        name: result.collectorName,
        value: result.totalVotes,
    }));

    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
            <PieChart width={400} height={400}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
};

export default UserResultsChart;
