import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to get auth headers
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${Cookies.get("chat-token")}`,
});

// ============ USER APIs ============

export const fetchSelectedUser = async (selectedUserId) => {
  try {
    const response = await axios.post(
      `${API_URL}/user/selected-user`,
      { selectedUserId },
      { headers: getAuthHeaders() },
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching selected user:", error);
    throw error;
  }
};

// ============ MESSAGE APIs ============

export const fetchAllMessages = async (withUserId) => {
  try {
    const response = await axios.post(
      `${API_URL}/message/get-all-msg`,
      { withUserId },
      { headers: getAuthHeaders() },
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const markAllMessagesAsRead = async (withUserId) => {
  try {
    await axios.post(
      `${API_URL}/message/mark-all-as-read/${withUserId}`,
      { withUserId },
      { headers: { Authorization: `Bearer ${Cookies.get("chat-token")}` } },
    );
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};

export const sendImageMessage = async (receiverId, message, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("receiver_id", receiverId);
    formData.append("message", message || "");
    formData.append("image", imageFile);

    const response = await axios.post(
      `${API_URL}/message/send-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${Cookies.get("chat-token")}`,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("Error sending image:", error);
    throw error;
  }
};

export const deleteConversation = async (withUserId) => {
  try {
    const response = await axios.post(
      `${API_URL}/message/delete-conversation`,
      { withUserId },
      { headers: getAuthHeaders() },
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};
