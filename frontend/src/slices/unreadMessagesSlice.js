import { createSlice } from "@reduxjs/toolkit";

export const unreadMessagesSlice = createSlice({
  name: "unreadMessages",
  initialState: {},
  reducers: {
    setMessageReceived: (state, action) => {
      const { userId } = action.payload;
      console.log("Setting message received for userId:", userId);
      state[userId] = true;
    },
    clearMessageReceived: (state, action) => {
      const { userId } = action.payload;
      state[userId] = false;
    },
  },
});

export const { setMessageReceived, clearMessageReceived } =
  unreadMessagesSlice.actions;

export default unreadMessagesSlice.reducer;
