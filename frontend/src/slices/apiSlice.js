import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";

const baseQuery = fetchBaseQuery({ baseUrl: BASE_URL });
export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Product", "Order", "User", "Analytics", "Chat"],
  endpoints: (builder) => ({
    // Endpoint to get chat history
    getChatHistory: builder.query({
      query: (targetUserId) => {
        console.log(`Querying /chat/history for targetUserId: ${targetUserId}`);
        return `/api/chat/history/${targetUserId}`;
      },
      providesTags: ["Chat"],
    }),

    // New endpoint to get admin chat sessions
    getAdminSessions: builder.query({
      query: () => "/api/chat/admin-sessions",
      providesTags: ["Chat"],
    }),

    // // Endpoint to send a chat message
    // sendChatMessage: builder.mutation({
    //   query: (messageData) => ({
    //     url: "/chat/send",
    //     method: "POST",
    //     body: messageData,
    //   }),
    //   invalidatesTags: ["Chat"],
    // }),
  }),
});

export const { useGetChatHistoryQuery, useGetAdminSessionsQuery } = apiSlice;
