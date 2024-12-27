import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Spin, notification } from "antd";
import axios from "axios";
import { setDiscussion, setNewCommentAdded } from "../features/discussionSlice";
import DiscussionCard from "../components/DiscussionCard";
import BASE_URL from "../config/baseUrl";
const UserDiscussionPage = () => {
    const { discussionLink, userLink } = useParams();
    const dispatch = useDispatch();
    const discussion = useSelector((state) => state.discussion.currentDiscussion);
    const newCommentAdded = useSelector((state) => state.discussion.newCommentAdded);
    console.log("user page rendered")

    useEffect(() => {
        const fetchDiscussion = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/discussion/${discussionLink}/${userLink}`);
                dispatch(setDiscussion(response.data.message));
            } catch (error) {
                notification.error({
                    message: "Error",
                    description: error.response?.data?.error || "Failed to load discussion.",
                });
            }
        };

        if (!discussion || discussion.link !== discussionLink) {
            fetchDiscussion();
        }
    }, [dispatch, discussionLink, newCommentAdded]);

    if (!discussion) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1000, margin: "auto", marginTop: 50 }}>
            <button
                className="ant-btn"

                onClick={() => window.location.href = "/"}
            >
                Create Your Own Discussion
            </button>
            <DiscussionCard discussion={discussion} discussionLink={discussionLink}
                userLink={userLink} />

        </div>
    );
};

export default UserDiscussionPage;
