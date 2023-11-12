import { ANALYTICS_URL } from "../constants";
import { apiSlice } from "./apiSlice"; // assuming apiSlice is already defined as createApi

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint for fetching analytics data for a single date
    getAnalyticsDate: builder.query({
      query: (date) => ({
        url: ANALYTICS_URL,
        params: { date }, // Pass the single date as a query parameter
      }),
      providesTags: (result, error, date) => [{ type: "Analytics", date }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAnalyticsDateQuery } = analyticsApiSlice;
