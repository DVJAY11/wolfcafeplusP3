import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGroupOrder } from "../context/GroupOrderContext";

const GroupOrder = () => {
  const navigate = useNavigate();
  const {
    startGroupOrder,
    joinGroupOrderWithCode,
    shareCode,
    groupOrder,
    loading,
  } = useGroupOrder();

  const [joinCode, setJoinCode] = useState("");

  const handleStart = async () => {
    try {
      const order = await startGroupOrder();
      navigate(`/group-order/${order.shareCode}`);
    } catch (err) {
      alert("Failed to start group order");
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      const order = await joinGroupOrderWithCode(joinCode.trim().toUpperCase());
      navigate(`/group-order/${order.shareCode}`);
    } catch (err) {
      alert("Failed to join group order. Check the code and try again.");
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto" }}>
      <h1>Group Order</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Start a Group Order</h2>
        <p>Create a new group order and share the code with friends.</p>
        <button onClick={handleStart} disabled={loading}>
          {loading ? "Starting..." : "Start Group Order"}
        </button>
        {shareCode && groupOrder && (
          <p style={{ marginTop: "0.5rem" }}>
            Active code: <strong>{shareCode}</strong>
          </p>
        )}
      </section>

      <section>
        <h2>Join a Group Order</h2>
        <form onSubmit={handleJoin}>
          <input
            type="text"
            maxLength={6}
            placeholder="Enter code (e.g., YX5TQ0)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            style={{ textTransform: "uppercase" }}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Joining..." : "Join"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default GroupOrder;
