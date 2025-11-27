import GroupOrder from "../models/GroupOrder.js";

// helper: generate a 6-char share code
function generateShareCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// POST /api/group-orders
export const createGroupOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // ensure unique share code
    let shareCode;
    let existing;
    do {
      shareCode = generateShareCode();
      existing = await GroupOrder.findOne({ shareCode });
    } while (existing);

    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // +2h

    const groupOrder = await GroupOrder.create({
      creator: userId,
      participants: [{ user: userId, items: [] }],
      status: "open",
      shareCode,
      splitType: "equal",
      subtotal: 0,
      tax: 0,
      tip: 0,
      total: 0,
      expiresAt,
    });

    return res.status(201).json({ groupOrder });
  } catch (err) {
    console.error("Error creating group order:", err);
    return res.status(500).json({ message: "Failed to create group order" });
  }
};

// GET /api/group-orders/:shareCode
export const getGroupOrder = async (req, res) => {
  try {
    const { shareCode } = req.params;

    const groupOrder = await GroupOrder.findOne({ shareCode })
      .populate("creator", "name email")
      .populate("participants.user", "name email")
      .populate("participants.items.menuItem");

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    if (groupOrder.expiresAt < new Date()) {
      return res.status(410).json({ message: "Group order has expired" });
    }

    return res.json({ groupOrder });
  } catch (err) {
    console.error("Error fetching group order:", err);
    return res.status(500).json({ message: "Failed to fetch group order" });
  }
};
