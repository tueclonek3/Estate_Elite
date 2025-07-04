// import { defer } from "react-router-dom";
import apiRequest from "./apiRequest";

export const singlePageLoader = async ({ request, params }) => {
  try {
    const res = await apiRequest.get("/posts/" + params.id);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      return { error: "Unauthorized" };
    }
    throw err;
  }
};

export const listPageLoader = async ({ request, params }) => {
  const query = new URL(request.url).searchParams.toString();
  try {
    const res = await apiRequest.get("/posts?" + query);
    // Ensure we always return an array for data
    return { postResponse: res.data || [] };
  } catch (err) {
    if (err.response?.status === 401) {
      return { postResponse: [] };
    }
    throw err;
  }
};

export const profilePageLoader = async () => {
  try {
    const [postResponse, chatResponse] = await Promise.all([
      apiRequest.get("/users/profilePosts"),
      apiRequest.get("/chats"),
    ]);
    return {
      postResponse: postResponse.data,
      chatResponse: chatResponse.data,
    };
  } catch (err) {
    if (err.response?.status === 401) {
      return {
        postResponse: { userPosts: [], savedPosts: [] },
        chatResponse: [],
      };
    }
    throw err;
  }
};