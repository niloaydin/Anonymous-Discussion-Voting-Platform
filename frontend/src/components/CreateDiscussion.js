import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, notification, InputNumber } from "antd";
import BASE_URL from "../config/baseUrl";
import axios from "axios";

const { TextArea } = Input;


const CreateDiscussion = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreateDiscussion = async (values) => {
        setLoading(true);
        try {
            const { email, title, description, duration } = values;
            const response = await axios.post(BASE_URL + "/discussion/create", {
                email,
                title,
                description,
                duration,
            });

            const { dLink, adminLink } = response.data.message;
            notification.success({
                message: "Discussion Created",
                description: "Redirecting to your discussion page...",
            });
            navigate(`/discussion/${dLink}/a/${adminLink}`);
        } catch (error) {
            notification.error({
                message: "Error",
                description: error.response?.data?.message || "Something went wrong.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Create a New Discussion" style={{ maxWidth: 600, margin: "auto", marginTop: 50 }}>
            <Form
                layout="vertical"
                onFinish={handleCreateDiscussion}
                initialValues={{ duration: 10 }}
            >
                <Form.Item
                    label="Admin Email"
                    name="email"
                    rules={[
                        { required: true, message: "Please input your email!" },
                        { type: "email", message: "Please enter a valid email!" },
                    ]}
                >
                    <Input placeholder="Enter your email" />
                </Form.Item>

                <Form.Item
                    label="Discussion Title"
                    name="title"
                    rules={[{ required: true, message: "Please input the discussion title!" }]}
                >
                    <Input placeholder="Enter discussion title" />
                </Form.Item>

                <Form.Item
                    label="Discussion Description"
                    name="description"
                    rules={[{ required: true, message: "Please input the discussion description!" }]}
                >
                    <TextArea rows={4} placeholder="Enter discussion description" />
                </Form.Item>

                <Form.Item
                    label="Duration (in minutes)"
                    name="duration"
                    rules={[
                        { required: true, message: "Please input the duration!" },
                        { type: "number", min: 1, message: "Duration must be at least 1 minute!" },
                    ]}
                >
                    <InputNumber placeholder="Duration in minutes" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        {loading ? "Creating..." : "Create Discussion"}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CreateDiscussion;
