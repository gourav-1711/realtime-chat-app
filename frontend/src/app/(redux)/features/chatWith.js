import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
    chatWith: Cookies.get("chatWith") || null
}

const chatWithSlice = createSlice({
    name: "chatWith",
    initialState,
    reducers: {
        setChatWith: (state, action) => {
            state.chatWith = action.payload
            Cookies.set("chatWith", action.payload ,{
              expires: 7,
              path: "/",
              sameSite: "lax",
              secure: true,
            })
        },
        removeChatWith: (state) => {
            state.chatWith = null
            Cookies.remove("chatWith")
        }
    }
})

export const { setChatWith, removeChatWith } = chatWithSlice.actions
export default chatWithSlice.reducer