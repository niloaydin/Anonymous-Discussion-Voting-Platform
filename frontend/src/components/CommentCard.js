import React, { useState } from "react";
import { Input, Button } from "antd";

const CommentCard = ({ onSubmit, placeholder }) => {
    const [comment, setComment] = useState("");

    const handleCommentSubmit = () => {
        if (comment.trim()) {
            onSubmit(comment);
            setComment(""); 
        }
    };

    return (
        <div style={{ marginTop: 16 }}>
            <Input.TextArea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={placeholder}
            />
            <Button
                type="primary"
                style={{ marginTop: 8 }}
                onClick={handleCommentSubmit}
                disabled={!comment.trim()}
            >
                Submit
            </Button>
        </div>
    );
};

export default CommentCard;
