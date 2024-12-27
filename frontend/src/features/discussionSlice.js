import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentDiscussion: null,
  newCommentAdded: false
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
  },
});

export const { setDiscussion, setNewCommentAdded } = discussionSlice.actions;

export default discussionSlice.reducer; 
