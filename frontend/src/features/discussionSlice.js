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
    addComment(state, action) {
      const { commentType, content } = action.payload;

      if (state.currentDiscussion) {
        if (commentType === "pros") {
          state.currentDiscussion.prosComments.push(content);
        } else if (commentType === "cons") {
          state.currentDiscussion.consComments.push(content);
        }
      }
    },
    setIsVotingStarted: (state, action) => {
      state.isVotingStarted = action.payload; 
    },
  },
});

export const { setDiscussion, setNewCommentAdded,setVoted,setIsVotingStarted,addComment } = discussionSlice.actions;

export default discussionSlice.reducer; 
