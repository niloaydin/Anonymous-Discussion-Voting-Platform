import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { notification } from "antd";
import axios from "axios";
import {BASE_URL} from "../config/baseUrl";
import UserResultsTable from "../components/UserResultsTable";
import UserResultsChart from "../components/UserResultsChart";

const UserResultsPage = () => {
    const { discussionLink, userLink } = useParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${BASE_URL}/discussion/${discussionLink}/${userLink}/results`
            );
            setResults(response.data.results);
        } catch (error) {
            notification.error({
                message: "Error",
                description: error.response?.data?.error || "Failed to fetch results.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    return (
        <div style={{ maxWidth: 1000, margin: "auto", marginTop: 50 }}>
            <h2>Voting Results</h2>
            {results.length > 0 ? (
                <><UserResultsTable results={results} loading={loading} /><UserResultsChart results={results} /></>
            ) : (
                <p>{loading ? "Loading results..." : "No results available for this discussion."}</p>
            )}
        </div>
    );
};

export default UserResultsPage;
