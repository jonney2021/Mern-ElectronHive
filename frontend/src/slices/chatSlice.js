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

    // initializeChatHistory: (state, action) => {
    //   // Assuming action.payload is an object with keys as userIds
    //   // and values as arrays of messages
    //   Object.entries(action.payload).forEach(([userId, chatData]) => {
    //     if (!state.chatRooms[userId]) {
    //       state.chatRooms[userId] = {
    //         userName: chatData.userName,
    //         messages: [...chatData.messages],
    //       };
    //     } else {
    //       // If chat room already exists, concatenate the messages
    //       state.chatRooms[userId].messages = [
    //         ...state.chatRooms[userId].messages,
    //         ...chatData.messages,
    //       ];
    //     }
    //   });
    // },
    // Add more reducers as needed, e.g., to create new chat room, close chat room, etc.
  },
});

// export const { addMessage, initializeChatHistory } = chatSlice.actions;
export const { addMessage } = chatSlice.actions;
export default chatSlice.reducer;
