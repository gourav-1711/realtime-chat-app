import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    name: "",
    email: "",
    mobile: "",
    description: "",
    avatar: "",
};

const profile = createSlice({
    name: "profile",
    initialState,
    reducers: {
        updateProfile: (state, action) => {
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.mobile = action.payload.mobile;
            state.description = action.payload.description;
            state.avatar = action.payload.avatar;
        },
    },
});

export const { updateProfile } = profile.actions;
export default profile.reducer;
