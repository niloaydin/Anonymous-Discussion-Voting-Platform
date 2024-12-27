import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateDiscussion from "./components/CreateDiscussion";
import Home from "./components/Home";
import AdminDiscussionPage from "./pages/AdminDiscussionPage";
import UserDiscussionPage from "./pages/UserDiscussionPage";
import UserVotingPage from "./pages/UserVotingPage";
import VotingResultsPage from "./pages/VotingResultsPage";
import UserResultsPage from "./pages/UserResultsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-discussion" element={<CreateDiscussion />} />
        <Route path="/discussion/:discussionLink/a/:adminLink" element={<AdminDiscussionPage />} />
        <Route path="/discussion/:discussionLink/:userLink" element={<UserDiscussionPage />} />
        <Route path="/discussion/:discussionLink/:userLink/vote" element={<UserVotingPage />} />
        <Route path="/discussion/:discussionLink/a/:adminLink/admin-results" element={<VotingResultsPage />} />
        <Route path="/discussion/:discussionLink/:userLink/results" element={<UserResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
