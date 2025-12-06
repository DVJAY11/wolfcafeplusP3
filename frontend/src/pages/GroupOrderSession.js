import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGroupOrder } from "../context/GroupOrderContext";

export default function GroupOrderSession() {
  const { shareCode } = useParams();
  const {
    groupOrder,
    fetchGroupOrderByShareCode,
    leaveGroupOrder,
    finalizeGroupOrder,
  } = useGroupOrder();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔄 Load the group order when the page opens / shareCode changes
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        // 🚀 call context function – we don't put it in deps on purpose
        await fetchGroupOrderByShareCode(shareCode);
      } catch (err) {
        console.error("Failed to load group order:", err);
        if (!cancelled) {
          setError(
            "We couldn’t find a group order with that code. " +
              "It may be invalid, expired, or already closed."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [shareCode]); // 👈 ONLY depends on shareCode now


  const handleLeave = async () => {
    try {
      await leaveGroupOrder();
      // After leaving, just show a simple message; you can also redirect if you want
      setError("You left this group order.");
    } catch (err) {
      console.error("Failed to leave group order:", err);
      alert("Could not leave group order.");
    }
  };

  const handleFinalize = async () => {
    try {
      await finalizeGroupOrder();
      alert("Group order finalized!");
    } catch (err) {
      console.error("Failed to finalize group order:", err);
      alert("Could not finalize group order.");
    }
  };

  // ⏳ Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">Group Order</h1>
        <p>Loading group order…</p>
      </div>
    );
  }

  // ❌ Error / not found
  if (error || !groupOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">Group Order</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <p>
          Please check the code and try again from the{" "}
          <Link to="/group-order" className="text-red-600 underline">
            Group Order
          </Link>{" "}
          page.
        </p>
      </div>
    );
  }

  // ✅ Normal view – we have a groupOrder
  const itemCount = (groupOrder.participants || []).reduce(
    (sum, p) => sum + (p.items?.length || 0),
    0
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Group Order Session</h1>

      <div className="mb-6">
        <div className="text-lg">
          Share code:{" "}
          <span className="font-mono font-semibold">
            {groupOrder.shareCode}
          </span>
        </div>
        <div className="text-gray-700">
          Status: <strong>{groupOrder.status}</strong>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Participants</h2>
        {(groupOrder.participants || []).length === 0 ? (
          <p className="text-gray-600">No participants yet.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {groupOrder.participants.map((p) => (
              <li key={p._id}>
                {p.user?.name || p.user?.email || "Unknown user"} –{" "}
                {(p.items || []).length} item(s)
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Totals</h2>
        <p>Subtotal: ${groupOrder.subtotal?.toFixed(2) ?? "0.00"}</p>
        <p>Tax: ${groupOrder.tax?.toFixed(2) ?? "0.00"}</p>
        <p>Tip: ${groupOrder.tip?.toFixed(2) ?? "0.00"}</p>
        <p className="font-bold">
          Total: ${groupOrder.total?.toFixed(2) ?? "0.00"} · {itemCount} item(s)
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleLeave}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
        >
          Leave Group
        </button>

        <button
          onClick={handleFinalize}
          disabled={groupOrder.status !== "open"}
          className={`px-4 py-2 rounded-lg text-white font-semibold ${
            groupOrder.status === "open"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Finalize Order
        </button>
      </div>
    </div>
  );
}
