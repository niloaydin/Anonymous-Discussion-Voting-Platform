import React, { useEffect, useState } from "react";
import { Card, List, Row, Col, notification } from "antd";
import CountdownClock from "./CountDownClock";
import { useDispatch, useSelector } from "react-redux";
import { setNewCommentAdded } from "../features/discussionSlice";
import CommentCard from "./CommentCard";
import axios from "axios";
import {BASE_URL} from "../config/baseUrl";

const DiscussionCard = ({ discussion, discussionLink, userLink }) => {
  const dispatch = useDispatch();
  const newCommentAdded = useSelector((state) => state.discussion.newCommentAdded);

  const handleAddComment = async (type, content) => {
    try {
      await axios.post(`${BASE_URL}/discussion/${discussionLink}/${userLink}/comment`, {
        commentType: type,
        content,
      });
      dispatch(setNewCommentAdded(!newCommentAdded));
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.response?.data?.error || "Failed to add comment.",
      });
    }
  };


  return (
    <Card title={`Discussion: ${discussion.title}`} bordered>
      <p>
        <strong>Description:</strong> {discussion.description}
      </p>
      <p>
        <strong>Start Date:</strong>{" "}
        {new Date(discussion.startDate).toLocaleString()}
      </p>
      <p>
        <strong>End Date:</strong> {new Date(discussion.endDate).toLocaleString()}
      </p>
      <p>Has Voting Started?</p> {discussion.isVotingStarted ? "Yes" : "No"}
      <p>Has Voting Ended?</p> {discussion.isVotingEnded ? "Yes" : "No"}
      <p>Has Emails Been Sent?</p> {discussion.isEmailSent ? "Yes" : "No"}

      <CountdownClock endDate={discussion.endDate} />

      {/* Pros and Cons Side by Side */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col span={12}>
          <Card title="Pros" bordered>
            {discussion.prosComments.length > 0 ? (
              <List
                dataSource={discussion.prosComments}
                renderItem={(item) => <List.Item>{item}</List.Item>}
              />
            ) : (
              <p>No comments yet.</p>
            )}
            {!discussion.isVotingStarted &&
              <CommentCard
                placeholder="Positive"
                onSubmit={(content) => handleAddComment("pros", content)}
              />
            }
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Cons" bordered>
            {discussion.consComments.length > 0 ? (
              <List
                dataSource={discussion.consComments}
                renderItem={(item) => <List.Item>{item}</List.Item>}
              />
            ) : (
              <p>No comments yet.</p>
            )}
            {!discussion.isVotingStarted &&
              <CommentCard
                placeholder="Negative"
                onSubmit={(content) => handleAddComment("cons", content)}
              />
            }
          </Card>
        </Col>
      </Row>

    </Card>
  );
};

export default DiscussionCard;
