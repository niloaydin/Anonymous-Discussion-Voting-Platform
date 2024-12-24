import { configureStore } from "@reduxjs/toolkit";
import discussionReducer from "./features/discussionSlice";

const store = configureStore({
    reducer: {
        discussion: discussionReducer,
    },
});
export default store;
