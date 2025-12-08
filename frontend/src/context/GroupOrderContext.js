// frontend/src/context/GroupOrderContext.js
import React, { createContext, useContext, useState } from "react";
import api from "../api/axios";

const GroupOrderContext = createContext(null);

export const GroupOrderProvider = ({ children }) => {
  const [groupOrder, setGroupOrder] = useState(null);

  // Start a new group order for the logged-in user
  const startGroupOrder = async () => {
    const res = await api.post("/group-orders");
    setGroupOrder(res.data.groupOrder);
    return res.data.groupOrder; // caller can navigate using shareCode
  };

  // Join an existing group order by share code
  const joinGroupOrder = async (shareCode) => {
    const res = await api.post(`/group-orders/${shareCode}/join`);
    setGroupOrder(res.data.groupOrder);
    return res.data.groupOrder;
  };

  // Fetch a group order by share code (e.g. when opening /group-order/:shareCode)
  const fetchGroupOrderByShareCode = async (shareCode) => {
    const res = await api.get(`/group-orders/${shareCode}`);
    setGroupOrder(res.data.groupOrder);
    return res.data.groupOrder;
  };

  // ✅ Add an item for the current user to the *current* group order
  // MenuItemCard calls: addItemToGroupOrder(item._id, 1, [])
  const addItemToGroupOrder = async (
    menuItemId,
    quantity = 1,
    customizations = []
  ) => {
    if (!groupOrder?._id) {
      throw new Error("No active group order to add items to.");
    }

    const res = await api.post(
      `/group-orders/${groupOrder._id}/items`,
      { menuItemId, quantity, customizations }
    );

    setGroupOrder(res.data.groupOrder);
    return res.data.groupOrder;
  };

  // Remove one of *your* items from the current group order
  const removeItemFromGroupOrder = async (itemId) => {
    if (!groupOrder?._id) {
      throw new Error("No active group order to remove items from.");
    }

    const res = await api.delete(
      `/group-orders/${groupOrder._id}/items/${itemId}`
    );

    setGroupOrder(res.data.groupOrder);
    return res.data.groupOrder;
  };

  // Leave the current group order
  const leaveGroupOrder = async () => {
    if (!groupOrder?._id) return;

    const res = await api.delete(`/group-orders/${groupOrder._id}/leave`);
    setGroupOrder(null);
    return res.data;
  };

  // Finalize / checkout the group order (creator only)
  const finalizeGroupOrder = async () => {
    if (!groupOrder?._id) {
      throw new Error("No active group order to finalize.");
    }

    const res = await api.post(
      `/group-orders/${groupOrder._id}/finalize`
    );

    setGroupOrder(res.data.groupOrder);
    return res.data.groupOrder;
  };

  return (
    <GroupOrderContext.Provider
      value={{
        groupOrder,
        setGroupOrder,
        startGroupOrder,
        joinGroupOrder,
        fetchGroupOrderByShareCode,
        addItemToGroupOrder,
        removeItemFromGroupOrder,
        leaveGroupOrder,
        finalizeGroupOrder,
      }}
    >
      {children}
    </GroupOrderContext.Provider>
  );
};

export const useGroupOrder = () => useContext(GroupOrderContext);
