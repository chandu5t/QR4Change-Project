// src/services/modelApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const modelApi = createApi({
  reducerPath: "modelApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://127.0.0.1:8000/api/" }),
  endpoints: (builder) => ({
    // Image-based pothole verification model
    predictModel: builder.mutation({
      query: (formData) => ({
        url: "predict/",
        method: "POST",
        body: formData, // must be FormData with image
      }),
    }),

    // Electral (urgency classification) model
    predictUrgency: builder.mutation({
      query: (textData) => ({
        url: "predict-urgency/",
        method: "POST",
        body: textData, // { text: "your complaint description" }
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),



//Garbage

    predictGarbageModel: builder.mutation({
      query: (formData) => ({
        url: "garbage/",
        method: "POST",
        body: formData, // must be FormData with image
      }),
    }),


  }),
});

export const { usePredictModelMutation, usePredictUrgencyMutation ,usePredictGarbageModelMutation} = modelApi;
