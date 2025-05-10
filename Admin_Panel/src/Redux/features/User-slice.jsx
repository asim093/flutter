import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: {},
  isLogin: false,
  email: "",
  darkmode: false,
  
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    AddData: (state, action) => {
      state.data = action.payload;
      state.isLogin = true;
    },
    RemoveData: (state, action) => {
      state.user = {};
      state.isLogin = false;
    },
    toggleDarkMode: (state) => {
      state.darkmode = !state.darkmode;
    },
  },
});

export const { addUser, removeUser, AddData , RemoveData , toggleDarkMode } = userSlice.actions;

export default userSlice.reducer;