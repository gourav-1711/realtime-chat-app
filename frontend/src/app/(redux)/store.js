// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import chatWithReducer from "./features/chatWith";
import lightBoxReducer from "./features/lightBox";
import profileReducer from "./features/profile";
export const store = configureStore({
  reducer: {
    chatWith: chatWithReducer,
    lightBox: lightBoxReducer,
    profile: profileReducer,
  },
});
