import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { notification, Button, Radio } from "antd";
import axios from "axios";
import {BASE_URL} from "../config/baseUrl";
import { useDispatch, useSelector } from "react-redux";
import { setVoted } from "../features/discussionSlice";

const UserVotingPage = () => {
    const { discussionLink, userLink } = useParams();
    const [voteType, setVoteType] = useState("");
    const [isGeneralCollector, setIsGeneralCollector] = useState(false);
    const dispatch = useDispatch();
    const hasVoted = useSelector((state) => state.discussion.votedDiscussions[discussionLink]);

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === "votedDiscussions") {
                const updatedVotedDiscussions = JSON.parse(event.newValue || "{}");
                if (updatedVotedDiscussions[discussionLink]) {
                    dispatch(setVoted({ discussionLink }));
                }
            }
        };

        const fetchCollectorInfo = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/discussion/${discussionLink}/a/${userLink}/collectors`);
                const collectors = response.data.message;

                const userInGeneralCollector = collectors.some(
                    (collector) =>
                        collector.type === "general" &&
                        collector.links.includes(userLink)
                );

                setIsGeneralCollector(userInGeneralCollector);

                // Check localStorage if the user is in a general collector group
                if (userInGeneralCollector) {
                    const votedDiscussions = JSON.parse(localStorage.getItem("votedDiscussions")) || {};
                    if (votedDiscussions[discussionLink]) {
                        dispatch(setVoted({ discussionLink }));
                    }
                    window.addEventListener("storage", handleStorageChange);

                    return () => {
                        window.removeEventListener("storage", handleStorageChange);
                    };
                }
            } catch (error) {
                notification.error({
                    message: "Error",
                    description: error.response?.data?.message || "Failed to fetch collector info.",
                });
            }
        };

        fetchCollectorInfo();


    }, [discussionLink, userLink, dispatch]);

    const handleVoteSubmit = async () => {
        try {
            if (!voteType) {
                notification.warning({ message: "Please select a vote option." });
                return;
            }
            const response = await axios.post(`${BASE_URL}/discussion/${discussionLink}/${userLink}/vote`, {
                voteType,
            });
            notification.success({ message: response.data.message });
            dispatch(setVoted({ discussionLink }));

            if (isGeneralCollector) {
                const votedDiscussions = JSON.parse(localStorage.getItem("votedDiscussions")) || {};
                votedDiscussions[discussionLink] = true;
                localStorage.setItem("votedDiscussions", JSON.stringify(votedDiscussions));
            }
        } catch (error) {
            notification.error({
                message: "Error",
                description: error.response?.data?.message || "Something went wrong.",
            });
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: "50px auto", textAlign: "center" }}>
            <h2>Vote on Discussion</h2>
            {hasVoted ? (
                <p>You have already voted for this discussion.</p>
            ) : (
                <><Radio.Group onChange={(e) => setVoteType(e.target.value)} value={voteType}>
                    <Radio value="yes">Yes</Radio>
                    <Radio value="no">No</Radio>
                    <Radio value="abstention">Abstain</Radio>
                </Radio.Group><br /><Button
                    type="primary"
                    onClick={handleVoteSubmit}
                    style={{ marginTop: 20 }}
                    disabled={!voteType}
                >
                        Submit Vote
                    </Button></>
            )}
        </div>
    );
};

export default UserVotingPage;
