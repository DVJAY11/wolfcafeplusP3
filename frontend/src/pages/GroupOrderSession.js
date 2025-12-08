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
  
  // 💰 helper: compute one participant's subtotal from their items
  const computeParticipantSubtotal = (participant) => {
    if (!participant?.items) return 0;

    return participant.items.reduce((sum, item) => {
      const basePrice = item.menuItem?.price || 0;
      const customTotal = (item.customizations || []).reduce(
        (s, c) => s + (c.price || 0),
        0
      );
      const qty = item.quantity || 1;
      return sum + (basePrice + customTotal) * qty;
    }, 0);
  };

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
      <h2 className="text-2xl font-semibold mb-2">Participants</h2>
      <section className="mt-6">
      <h2 className="text-2xl font-semibold mb-2">Participants</h2>

      <ul className="space-y-4">
        {groupOrder.participants?.map((p) => {
          const subtotal = computeParticipantSubtotal(p);
          const items = p.items || [];

          return (
            <li
              key={p._id || p.user?._id}
              className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
            >
              {/* Header line: Name + total items + subtotal */}
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-lg">
                  {p.user?.name || "Guest"}
                </span>

                <span className="text-sm text-gray-700">
                  {items.length} item(s) • ${subtotal.toFixed(2)}
                </span>
              </div>

              {/* Item list */}
              {items.length > 0 && (
                <ul className="ml-4 mt-1 list-disc text-sm text-gray-700 space-y-1">
                  {items.map((item) => {
                    const basePrice = item.menuItem?.price || 0;
                    const customTotal = (item.customizations || []).reduce(
                      (s, c) => s + (c.price || 0),
                      0
                    );
                    const unitPrice = basePrice + customTotal;
                    const qty = item.quantity || 1;

                    return (
                      <li key={item._id}>
                        <span className="font-medium">
                          {item.menuItem?.name || "Item"}
                        </span>
                        {` × ${qty} — $${(unitPrice * qty).toFixed(2)}`}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>


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
