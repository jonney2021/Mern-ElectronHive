import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chatRooms: {}, // chatRooms will be an object with keys as userIds
  pendingMessages: {}, // Pending messages stored when the admin is not on the chat page
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

    // Handle adding a new message to pending messages
    addPendingMessage: (state, action) => {
      const { userId, message } = action.payload;
      if (!state.pendingMessages[userId]) {
        state.pendingMessages[userId] = [message];
      } else {
        state.pendingMessages[userId].push(message);
      }
    },
    // Clear pending messages for a specific user (when the admin opens their chat)
    clearPendingMessages: (state, action) => {
      const userId = action.payload;
      state.pendingMessages[userId] = [];
    },
  },
});

export const { addMessage, addPendingMessage, clearPendingMessages } =
  chatSlice.actions;
export default chatSlice.reducer;
