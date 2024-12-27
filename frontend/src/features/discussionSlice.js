import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentDiscussion: null,
  newCommentAdded: false,
  votedDiscussions: {},
  isVotingStarted: false,
};

const discussionSlice = createSlice({
  name: "discussion",
  initialState,
  reducers: {
    setDiscussion: (state, action) => {
      state.currentDiscussion = action.payload;
    },
    setNewCommentAdded: (state, action) => {
      state.newCommentAdded = action.payload;
    },
    setVoted: (state, action) => {
      const { discussionLink } = action.payload;
      state.votedDiscussions[discussionLink] = true;
    },
    setIsVotingStarted: (state, action) => {
      state.isVotingStarted = action.payload; 
    },
  },
});

export const { setDiscussion, setNewCommentAdded,setVoted,setIsVotingStarted } = discussionSlice.actions;

export default discussionSlice.reducer; 
