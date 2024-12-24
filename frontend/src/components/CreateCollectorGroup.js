import React, { useState, useEffect } from "react";
import { Form, Input, Radio, Button, notification, Card, List, Typography } from "antd";
import axios from "axios";
import BASE_URL from "../config/baseUrl";

const { Text } = Typography;

const CreateCollectorGroup = ({ discussionLink, adminLink, onCollectorCreated, onClose }) => {
    const [form] = Form.useForm();
    const [collectorType, setCollectorType] = useState("general");
    const [loading, setLoading] = useState(false);
    const [links, setLinks] = useState([]); 
    const [emails, setEmails] = useState([]);
    const [emailInput, setEmailInput] = useState(""); 


    const addEmail = () => {
        if (!emailInput || !/^[^,\s]+@[^,\s]+\.[^,\s]+$/.test(emailInput)) {
            notification.error({
                message: "Invalid Email",
                description: "Please enter a valid email address.",
            });
            return;
        }
        setEmails([...emails, emailInput.trim()]);
        setEmailInput("");
    };


    const removeEmail = (index) => {
        const updatedEmails = emails.filter((_, i) => i !== index);
        setEmails(updatedEmails);
    };

    const handleCreateCollector = async (values) => {
        setLoading(true);
        try {
            const { collectorName } = values;
            const payload = {
                collectorName,
                type: collectorType,
                emails: collectorType === "specific" ? emails : [],
            };

            const response = await axios.post(
                `${BASE_URL}/discussion/${discussionLink}/a/${adminLink}/create-collector`,
                payload
            );

            notification.success({
                message: "Collector Group Created",
                description: "Successfully created the collector group!",
            });

            setLinks(response.data.message.listLinks);
            setEmails([]); 
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
        return () => {
            setLinks([]);
            form.resetFields();
            setEmails([]);
        };
    }, [onClose]);

    return (
        <div>
            {links.length === 0 ? (
     
                <Form form={form} layout="vertical" onFinish={handleCreateCollector}>
                    <Form.Item
                        label="Collector Name"
                        name="collectorName"
                        rules={[{ required: true, message: "Please enter a collector name!" }]}
                    >
                        <Input placeholder="Enter collector group name" />
                    </Form.Item>

                    <Form.Item label="Collector Type" name="collectorType" initialValue="general">
                        <Radio.Group onChange={(e) => setCollectorType(e.target.value)}>
                            <Radio value="general">General (One Link)</Radio>
                            <Radio value="specific">Specific (Emails)</Radio>
                        </Radio.Group>
                    </Form.Item>

                    {collectorType === "specific" && (
                        <>
                            <Form.Item label="Add Emails">
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <Input
                                        placeholder="Enter an email address"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        onPressEnter={addEmail}
                                    />
                                    <Button type="primary" onClick={addEmail}>
                                        Add
                                    </Button>
                                </div>
                            </Form.Item>

                
                            <List
                                size="small"
                                bordered
                                dataSource={emails}
                                renderItem={(email, index) => (
                                    <List.Item
                                        actions={[
                                            <Button
                                                type="link"
                                                danger
                                                onClick={() => removeEmail(index)}
                                            >
                                                Remove
                                            </Button>,
                                        ]}
                                    >
                                        {email}
                                    </List.Item>
                                )}
                            />
                        </>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Create
                        </Button>
                    </Form.Item>
                </Form>
            ) : (

                <Card title="Generated Links" bordered>
                    <List
                        dataSource={links}
                        renderItem={(link, index) => (
                            <List.Item>
                                <Text copyable>{`${BASE_URL}/discussion/${discussionLink}/${link}`}</Text>
                            </List.Item>
                        )}
                    />
                    <Button
                        type="default"
                        onClick={onClose}
                        style={{ marginTop: 20, display: "block", width: "100%" }}
                    >
                        Close
                    </Button>
                </Card>
            )}
        </div>
    );
};

export default CreateCollectorGroup;
