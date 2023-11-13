import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chatRooms: {}, // chatRooms will be an object with keys as userIds
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const { userId, userName, message } = action.payload;
      if (!state.chatRooms[userId]) {
        // Initialize a new chat room with userName if it doesn't exist
        state.chatRooms[userId] = { userName, messages: [message] };
      } else {
        // Add new message to existing chat room
        state.chatRooms[userId].messages.push(message);
      }
    },
  },
});

export const { addMessage } = chatSlice.actions;
export default chatSlice.reducer;
