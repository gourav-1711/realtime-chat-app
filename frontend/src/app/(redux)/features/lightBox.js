import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  image: {
    src: "",
    alt: "",
    title: "",
    description: "",
  },
  images: [],
  index: 0,
};

const lightBox = createSlice({
  name: "lightBox",
  initialState,
  reducers: {
    openLightBox: (state, action) => {
      state.isOpen = true;
      state.image = action.payload.image;
      state.images = [...state.images, action.payload.image];
      state.index = action.payload.index || 0;
    },
    closeLightBox: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openLightBox, closeLightBox } = lightBox.actions;
export default lightBox.reducer;
