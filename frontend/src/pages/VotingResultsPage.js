import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Checkbox, Button, notification, Table } from "antd";
import axios from "axios";
import BASE_URL from "../config/baseUrl";

const VotingResultsPage = () => {
    const { discussionLink, adminLink } = useParams();
    const [results, setResults] = useState([]);
    const [selectedCollectors, setSelectedCollectors] = useState([]);
    const [submittedCollectors, setSubmittedCollectors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(true);
    const navigate = useNavigate();

    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${BASE_URL}/discussion/${discussionLink}/a/${adminLink}/results`
            );
            setResults(response.data.message);


            const discussionResponse = await axios.get(
                `${BASE_URL}/discussion/${discussionLink}/${adminLink}`
            );
            const { selectedCollectorIds } = discussionResponse.data.message;

            console.log(`SELECTED COLLECTOR IDS: ${selectedCollectorIds}`);
            if (selectedCollectorIds && selectedCollectorIds.length > 0) {
                setSubmittedCollectors(selectedCollectorIds);
                setIsEditing(false);
            }
        } catch (error) {
            notification.error({
                message: "Error",
                description: error.response?.data?.message || "Failed to fetch results.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCollectors = (collectorId, checked) => {
        setSelectedCollectors((prev) =>
            checked ? [...prev, collectorId] : prev.filter((id) => id !== collectorId)
        );
    };

    const handleSetResults = async () => {
        try {
            if (selectedCollectors.length === 0) {
                notification.warning({ message: "Please select at least one collector group." });
                return;
            }
            const response = await axios.post(
                `${BASE_URL}/discussion/${discussionLink}/a/${adminLink}/set-results`,
                { collectorIds: selectedCollectors }
            );
            notification.success({ message: response.data.message });
            setSubmittedCollectors(selectedCollectors);
            setIsEditing(false);
        } catch (error) {
            notification.error({
                message: "Error",
                description: error.response?.data?.message || "Failed to set results.",
            });
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

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
        {
            title: "Select",
            dataIndex: "collectorId",
            key: "collectorId",
            render: (collectorId) =>
                isEditing && (
                    <Checkbox
                        checked={selectedCollectors.includes(collectorId)}
                        onChange={(e) => handleSelectCollectors(collectorId, e.target.checked)}
                    />
                ),
        },
    ];

    return (
        <div style={{ maxWidth: 1000, margin: "auto", marginTop: 50 }}>
            <Button
                type="default"
                style={{ marginTop: 20 }}
                onClick={() => navigate(`/discussion/${discussionLink}/a/${adminLink}`)}
            >
                Back to Discussion Page
            </Button>
            <h2>Voting Results</h2>
            <Table
                dataSource={results}
                columns={columns}
                rowKey="collectorId"
                loading={loading}
                pagination={false}
            />
            {isEditing ? (
                <Button
                    type="primary"
                    style={{ marginTop: 20 }}
                    onClick={handleSetResults}
                    disabled={selectedCollectors.length === 0}
                >
                    Submit Results
                </Button>
            ) : (
                <div style={{ marginTop: 20 }}>
                    <h3>Results have been submitted successfully.</h3>
                    <p>
                        <strong>Selected Collectors:</strong>{" "}
                        {results
                            .filter((collector) => submittedCollectors.includes(collector.collectorId))
                            .map((collector) => collector.collectorName)
                            .join(", ")}
                    </p>
                    <Button
                        type="primary"
                        style={{ marginTop: 10 }}
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Results
                    </Button>
                </div>
            )}
        </div>
    );
};

export default VotingResultsPage;
