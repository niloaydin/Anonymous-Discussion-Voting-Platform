import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentDiscussion: null, 
};

const discussionSlice = createSlice({
  name: "discussion",
  initialState,
  reducers: {
    setDiscussion: (state, action) => {
      state.currentDiscussion = action.payload; 
    },
  },
});

export const { setDiscussion } = discussionSlice.actions; 

export default discussionSlice.reducer; 
