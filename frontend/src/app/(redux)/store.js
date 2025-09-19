// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import chatWithReducer  from "./features/chatWith";
export const store = configureStore({
  reducer: {
    chatWith: chatWithReducer,
  },
});
