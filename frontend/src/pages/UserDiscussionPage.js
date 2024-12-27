import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Spin, notification } from "antd";
import axios from "axios";
import { setDiscussion, setNewCommentAdded } from "../features/discussionSlice";
import DiscussionCard from "../components/DiscussionCard";
import BASE_URL from "../config/baseUrl";
import { Link, useNavigate } from "react-router-dom";

const UserDiscussionPage = () => {
    const { discussionLink, userLink } = useParams();
    const dispatch = useDispatch();
    const discussion = useSelector((state) => state.discussion.currentDiscussion);
    const newCommentAdded = useSelector((state) => state.discussion.newCommentAdded);
    const [hasNotified, setHasNotified] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDiscussion = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/discussion/${discussionLink}/${userLink}`);
                const discussionData = response.data.message;

                if (discussionData.isVotingStarted && !discussionData.isVotingEnded) {
                    navigate(`/discussion/${discussionLink}/${userLink}/vote`);
                } else {
                    dispatch(setDiscussion(discussionData));
                }

                if (
                    discussionData.selectedCollectorIds &&
                    discussionData.selectedCollectorIds.length > 0 &&
                    !hasNotified
                ) {
                    notification.info({
                        message: "Results Ready",
                        description: "The voting results are ready. Click 'See Voting Results' to view them.",
                        duration: 5,
                    });
                    setHasNotified(true);
                }

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
    }, [dispatch, discussionLink, userLink, navigate, newCommentAdded, hasNotified]);

    if (!discussion) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1000, margin: "auto", marginTop: 50 }}>
            <button>
                <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                    Create Your Own Discussion
                </Link>
            </button>
            <button type="primary" onClick={() => window.open(`/discussion/${discussionLink}/${userLink}/results`, '_blank')}>

                See Voting Results

            </button>
            <DiscussionCard discussion={discussion} discussionLink={discussionLink}
                userLink={userLink} />

        </div>
    );
};

export default UserDiscussionPage;
