import React from "react";
import { Table } from "antd";

const UserResultsTable = ({ results, loading }) => {
    const columns = [
        { title: "Collector Name", dataIndex: "collectorName", key: "collectorName" },
        { title: "Total Votes", dataIndex: "totalVotes", key: "totalVotes" },
        {
            title: "Vote Summary",
            dataIndex: "voteSummary",
            key: "voteSummary",
            render: (summary) =>
                Object.entries(summary)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", "),
        },
    ];

    return (
        <Table
            dataSource={results}
            columns={columns}
            rowKey="collectorId"
            loading={loading}
            pagination={false}
        />
    );
};

export default UserResultsTable;
