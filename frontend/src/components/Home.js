import React from "react";
import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Card
      title="Welcome to Anonymous Discussion Platform"
      style={{ maxWidth: 600, margin: "auto", marginTop: 50, textAlign: "center" }}
    >
      <p>Click below to create a new discussion.</p>
      <Button
        type="primary"
        size="large"
        onClick={() => navigate("/create-discussion")}
      >
        Create Discussion
      </Button>
    </Card>
  );
};

export default Home;
