import axios from "axios";

// // Create a single configured Axios instance
// const api = axios.create({
//   baseURL: "/api", // all requests go through the proxy
//   headers: {
//     "Content-Type": "application/json",
//   },
// });


const api = axios.create({
  baseURL:
    (process.env.REACT_APP_API_BASE_URL
      ? `${process.env.REACT_APP_API_BASE_URL}/api`
      : "http://localhost:8000/api"),
});


// Automatically attach JWT token (if logged in)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- SOCIAL GROUP ORDERING API HELPERS ----------

// Create a new group order (host starts a session)
export const createGroupOrder = () => {
  return api.post("/group-orders");
};

// Join existing group order via share code
export const joinGroupOrder = (shareCode) => {
  return api.post(`/group-orders/${shareCode}/join`);
};

// Fetch full group order details by share code
export const getGroupOrderByShareCode = (shareCode) => {
  return api.get(`/group-orders/${shareCode}`);
};

// Add an item to the current user's items in a group order
// payload shape: { menuItemId, quantity, customizations }
export const addToGroupOrder = (groupOrderId, payload) => {
  return api.post(`/group-orders/${groupOrderId}/items`, payload);
};

// Remove an item (only your own) from a group order
export const removeFromGroupOrder = (groupOrderId, itemId) => {
  return api.delete(`/group-orders/${groupOrderId}/items/${itemId}`);
};

// Finalize / checkout the group order (creator only)
export const finalizeGroupOrder = (groupOrderId) => {
  return api.post(`/group-orders/${groupOrderId}/finalize`);
};

// Leave a group order
export const leaveGroupOrder = (groupOrderId) => {
  return api.delete(`/group-orders/${groupOrderId}/leave`);
};


export default api;
