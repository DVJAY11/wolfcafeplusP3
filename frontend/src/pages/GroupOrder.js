// frontend/src/pages/GroupOrder.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGroupOrder } from "../context/GroupOrderContext";

export default function GroupOrder() {
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();

  // 👇 pull actions from context
  const { startGroupOrder, joinGroupOrder } = useGroupOrder();

  // Start a brand-new group order as the current user
  const handleStart = async () => {
    try {
      const group = await startGroupOrder();
      // go straight into that session
      navigate(`/group-order/${group.shareCode}`);
    } catch (err) {
      console.error("Failed to start group order:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to start group order. Please try again.";
      alert(msg);
    }
  };

  // Join an existing group order by share code
  const handleJoin = async () => {
    const code = joinCode.trim();
    if (!code) {
      alert("Please enter a group code.");
      return;
    }

    try {
      await joinGroupOrder(code);
      navigate(`/group-order/${code}`);
    } catch (err) {
      console.error("Failed to join group order:", err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to join group order. Check the code and try again.";

      alert(msg);
    }
  };

  return (
    <div className="max-w-xl mx-auto pt-24 px-4">
      <h1 className="text-3xl font-bold mb-6">Group Order</h1>

      {/* Start a new group order */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Start a Group Order</h2>
        <p className="text-gray-700 mb-3">
          Create a new group order and share the code with friends.
        </p>
        <button
          onClick={handleStart}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Start Group Order
        </button>
      </section>

      {/* Join existing group order */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Join a Group Order</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter group code"
            className="border rounded-lg px-3 py-2 flex-1"
          />
          <button
            onClick={handleJoin}
            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-medium"
          >
            Join
          </button>
        </div>
      </section>
    </div>
  );
}
