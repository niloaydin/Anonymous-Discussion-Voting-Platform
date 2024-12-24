import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, notification, Modal } from "antd";
import axios from "axios";
import BASE_URL from "../config/baseUrl";
import DiscussionCard from "../components/DiscussionCard";
import CreateCollectorGroup from "../components/CreateCollectorGroup";
import { useSelector, useDispatch } from "react-redux";
import { setDiscussion } from "../features/discussionSlice";

const AdminDiscussionPage = () => {
    const { discussionLink, adminLink } = useParams();
    const dispatch = useDispatch();
    const discussion = useSelector((state) => state.discussion.currentDiscussion);
    // const [discussion, setDiscussion] = useState(null);
    const [newCommentAdded, setNewCommentAdded] = useState(false); 
    const [collectors, setCollectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCollectorModalVisible, setIsCollectorModalVisible] = useState(false);
    const navigate = useNavigate();
    const FRONTEND_URL = window.location.origin;

    const fetchDiscussion = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${BASE_URL}/discussion/${discussionLink}/${adminLink}`
            );
            dispatch(setDiscussion(response.data.message));
        } catch (error) {
            notification.error({
                message: "Error",
                description: error.response?.data?.error || "Something went wrong.",
            });
        } finally {
            setLoading(false);
        }
    };
    const fetchCollectors = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}/discussion/${discussionLink}/a/${adminLink}/collectors`
            );
            setCollectors(response.data.message);
            console.log(`COLLECTORS: ${JSON.stringify(response.data.message[0])}`);
        } catch (error) {
            notification.error({
                message: "Error",
                description: error.response?.data?.error || "Failed to fetch collectors.",
            });
        }
    };
    useEffect(() => {
        fetchDiscussion();
    }, [discussionLink, adminLink, dispatch, newCommentAdded]);

    const handleCreateCollector = () => {
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const handleOpenCollectorModal = async () => {
        await fetchCollectors();
        setIsCollectorModalVisible(true);
    };

    const handleCloseCollectorModal = () => {
        setIsCollectorModalVisible(false);
    };

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

            />
            <button
                className="ant-btn"
                style={{ marginTop: 20, display: "block", margin: "0 auto" }}
                onClick={handleOpenCollectorModal}
            >
                View Collectors
            </button>
            {!discussion.isVotingStarted && (
                <button
                    className="ant-btn ant-btn-primary"
                    style={{ marginTop: 20, display: "block", margin: "0 auto" }}
                    onClick={handleCreateCollector}
                >
                    Create Collector Group
                </button>
            )}

            <Modal
                title="Create Collector Group"
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={null} // Remove default footer
            >
                <CreateCollectorGroup
                    discussionLink={discussionLink}
                    adminLink={adminLink}
                    onCollectorCreated={fetchDiscussion}
                    onClose={handleModalClose}
                />
            </Modal>
            {/* Modal for Viewing Collectors */}
            <Modal
                title="Collector Groups"
                visible={isCollectorModalVisible}
                onCancel={handleCloseCollectorModal}
                footer={null}
            >
                {collectors.length > 0 ? (
                    collectors.map((collector, index) => (
                        <div
                            key={index}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: 5,
                                padding: 15,
                                marginBottom: 20,
                            }}
                        >
                            <h3>{collector.name}</h3>
                            <p><strong>Type:</strong> {collector.type}</p>
                            {collector.type === "general" ? (
                                <p>
                                    <strong>Link:</strong> <a
                                        href={`${FRONTEND_URL}/discussion/${discussionLink}/${collector.links[0]}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {`${FRONTEND_URL}/discussion/${discussionLink}/${collector.links[0]}`}
                                    </a>
                                </p>
                            ) : (
                                <div>
                                    <p><strong>Emails and Links:</strong></p>
                                    <ul>
                                        {collector.emails?.map((email, i) => (
                                            <li key={i}>
                                                <strong>Email:</strong> {email} -
                                                <strong> Link:</strong> <a
                                                    href={`${FRONTEND_URL}/discussion/${discussionLink}/${collector.links[i]}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {`${FRONTEND_URL}/discussion/${discussionLink}/${collector.links[i]}`}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No collectors found for this discussion!</p>
                )}
            </Modal>
        </div>
    );
};

export default AdminDiscussionPage;
