import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, notification } from "antd";
import axios from "axios";
import BASE_URL from "../config/baseUrl";
import DiscussionCard from "../components/DiscussionCard";

const AdminDiscussionPage = () => {
    const { discussionLink, adminLink } = useParams();
    const [discussion, setDiscussion] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchDiscussion = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${BASE_URL}/api/discussion/${discussionLink}/${adminLink}`
            );
            setDiscussion(response.data.message);
        } catch (error) {
            notification.error({
                message: "Error",
                description: error.response?.data?.error || "Something went wrong.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscussion();
    }, [discussionLink, adminLink]);

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!discussion) {
        return <p>No discussion found!</p>;
    }

    return (
        <div style={{ maxWidth: 1000, margin: "auto", marginTop: 50 }}>
            <button onClick={() => navigate(`/`)}>Create Discussion</button>

            <DiscussionCard
                discussion={discussion}
                buttonText="Create Collector Group"
                onButtonClick={() =>
                    navigate(`/discussion/${discussionLink}/a/${adminLink}/create-collector`)
                }
            />
        </div>
    );
};

export default AdminDiscussionPage;
