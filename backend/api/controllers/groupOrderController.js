// backend/api/controllers/groupOrderController.js
import GroupOrder from "../models/GroupOrder.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";

// helper: generate a 6-char share code
function generateShareCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// helper: recalc subtotal / tax / total for the whole group
async function recalcGroupTotals(groupOrder) {
  const allMenuItemIds = [];

  groupOrder.participants.forEach((p) => {
    p.items.forEach((item) => {
      if (item.menuItem) {
        allMenuItemIds.push(item.menuItem);
      }
    });
  });

  if (allMenuItemIds.length === 0) {
    groupOrder.subtotal = 0;
    groupOrder.tax = 0;
    groupOrder.total = groupOrder.tip || 0;
    return;
  }

  const menuItems = await MenuItem.find({
    _id: { $in: allMenuItemIds },
  }).lean();

  const priceMap = new Map(
    menuItems.map((mi) => [mi._id.toString(), mi.price])
  );

  let subtotal = 0;

  groupOrder.participants.forEach((p) => {
    p.items.forEach((item) => {
      const basePrice = priceMap.get(item.menuItem.toString()) || 0;
      const customTotal = (item.customizations || []).reduce(
        (sum, c) => sum + (c.price || 0),
        0
      );
      const qty = item.quantity || 1;
      subtotal += (basePrice + customTotal) * qty;
    });
  });

  const taxRate = 0.07; // 7% – tweak if needed
  const tax = subtotal * taxRate;
  const tip = groupOrder.tip || 0;
  const total = subtotal + tax + tip;

  groupOrder.subtotal = subtotal;
  groupOrder.tax = tax;
  groupOrder.total = total;
}

/**
 * POST /api/group-orders
 * Create a new group order
 */
export const createGroupOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 2 hours expiry
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const groupOrder = await GroupOrder.create({
      creator: userId,
      participants: [{ user: userId, items: [] }],
      status: "open",
      shareCode: generateShareCode(),
      splitType: "equal",
      subtotal: 0,
      tax: 0,
      tip: 0,
      total: 0,
      expiresAt,
    });

    const populated = await GroupOrder.findById(groupOrder._id)
      .populate("creator", "name email")
      .populate("participants.user", "name email")
      .populate("participants.items.menuItem");

    return res.status(201).json({ groupOrder: populated });
  } catch (err) {
    console.error("Error creating group order:", err);
    return res.status(500).json({ message: "Failed to create group order" });
  }
};

/**
 * GET /api/group-orders/:shareCode
 * Get group order details by share code
 */
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

    return res.json({ groupOrder });
  } catch (err) {
    console.error("Error getting group order:", err);
    return res.status(500).json({ message: "Failed to get group order" });
  }
};

/**
 * POST /api/group-orders/:shareCode/join
 * Join an existing group order via share code
 */
export const joinGroupOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { shareCode } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const groupOrder = await GroupOrder.findOne({ shareCode });

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    if (groupOrder.expiresAt < new Date()) {
      return res.status(410).json({ message: "Group order has expired" });
    }

    if (groupOrder.status !== "open") {
      return res.status(400).json({ message: "Group order is not open" });
    }

    const alreadyParticipant = groupOrder.participants.some(
      (p) => p.user.toString() === userId.toString()
    );

    if (!alreadyParticipant) {
      groupOrder.participants.push({
        user: userId,
        items: [],
        joined: new Date(),
      });
      await groupOrder.save();
    }

    const populated = await GroupOrder.findById(groupOrder._id)
      .populate("creator", "name email")
      .populate("participants.user", "name email")
      .populate("participants.items.menuItem");

    return res.json({ groupOrder: populated });
  } catch (err) {
    console.error("Error joining group order:", err);
    return res.status(500).json({ message: "Failed to join group order" });
  }
};

/**
 * POST /api/group-orders/:id/items
 * Add an item to the current user's participant bucket
 */
export const addItemToGroupOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;
    const { menuItemId, quantity, customizations, mealGroupId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const groupOrder = await GroupOrder.findById(id);

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    if (groupOrder.expiresAt < new Date()) {
      return res.status(410).json({ message: "Group order has expired" });
    }

    if (groupOrder.status !== "open") {
      return res.status(400).json({ message: "Group order is not open" });
    }

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(400).json({ message: "Invalid menu item" });
    }

    let participant = groupOrder.participants.find(
      (p) => p.user.toString() === userId.toString()
    );

    if (!participant) {
      participant = {
        user: userId,
        items: [],
        joined: new Date(),
      };
      groupOrder.participants.push(participant);
    }

    const realParticipant = groupOrder.participants.find(
      (p) => p.user.toString() === userId.toString()
    );

    realParticipant.items.push({
      menuItem: menuItemId,
      quantity: quantity || 1,
      customizations: customizations || [],
      mealGroupId: mealGroupId || null,
    });

    await recalcGroupTotals(groupOrder);
    await groupOrder.save();

    const populated = await GroupOrder.findById(groupOrder._id)
      .populate("creator", "name email")
      .populate("participants.user", "name email")
      .populate("participants.items.menuItem");

    return res.json({ groupOrder: populated });
  } catch (err) {
    console.error("Error adding item to group order:", err);
    return res
      .status(500)
      .json({ message: "Failed to add item to group order" });
  }
};

/**
 * DELETE /api/group-orders/:id/items/:itemId
 * Remove one item (by its _id in the subdocument) from the current user's bucket
 */
export const removeItemFromGroupOrder = async (req, res) => {
    try {
      const userId = req.user?.id || req.user?._id;
      const { id, itemId } = req.params;
  
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
  
      const groupOrder = await GroupOrder.findById(id);
  
      if (!groupOrder) {
        return res.status(404).json({ message: "Group order not found" });
      }
  
      if (groupOrder.status !== "open") {
        return res.status(400).json({ message: "Group order is not open" });
      }
  
      const participant = groupOrder.participants.find(
        (p) => p.user.toString() === userId.toString()
      );
  
      if (!participant) {
        return res.status(403).json({ message: "You are not in this group" });
      }
  
      // ❌ old way (causing error):
      // const item = participant.items.id(itemId);
      // if (!item) { ... }
      // item.remove();
  
      // ✅ new way: filter array and remove item by _id
      const beforeCount = participant.items.length;
      participant.items = participant.items.filter(
        (it) => it._id.toString() !== itemId.toString()
      );
  
      if (participant.items.length === beforeCount) {
        return res
          .status(404)
          .json({ message: "Item not found in your group items" });
      }
  
      await recalcGroupTotals(groupOrder);
      await groupOrder.save();
  
      const populated = await GroupOrder.findById(groupOrder._id)
        .populate("creator", "name email")
        .populate("participants.user", "name email")
        .populate("participants.items.menuItem");
  
      return res.json({ groupOrder: populated });
    } catch (err) {
      console.error("Error removing item from group order:", err);
      return res
        .status(500)
        .json({ message: "Failed to remove item from group order" });
    }
  };
  
/**
 * DELETE /api/group-orders/:id/leave
 * Current user leaves the group. If no participants left, auto-complete.
 */
export const leaveGroupOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const groupOrder = await GroupOrder.findById(id);

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    groupOrder.participants = groupOrder.participants.filter(
      (p) => p.user.toString() !== userId.toString()
    );

    if (groupOrder.participants.length === 0) {
      groupOrder.status = "completed";
    }

    await groupOrder.save();

    const populated = await GroupOrder.findById(groupOrder._id)
      .populate("creator", "name email")
      .populate("participants.user", "name email")
      .populate("participants.items.menuItem");

    return res.json({ groupOrder: populated });
  } catch (err) {
    console.error("Error leaving group order:", err);
    return res.status(500).json({ message: "Failed to leave group order" });
  }
};

export const getMyGroupOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // 🔑 return any group order where:
    // - you are the creator OR
    // - you appear in participants.user
    const groupOrders = await GroupOrder.find({
      $or: [
        { creator: userId },
        { "participants.user": userId },
      ],
      // ❌ DO NOT filter by status: "open" here;
      // we want CLOSED / FINALIZED orders too.
    })
      .sort({ createdAt: -1 })
      .populate("creator", "name email")
      .populate("participants.user", "name email")
      .populate("participants.items.menuItem");

    return res.json({ groupOrders });
  } catch (err) {
    console.error("Error in getMyGroupOrders:", err);
    return res.status(500).json({ message: "Failed to fetch group orders" });
  }
};


/**
 * POST /api/group-orders/:id/finalize
 * Creator finalizes; creates individual Order docs for each participant
 */
export const finalizeGroupOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const groupOrder = await GroupOrder.findById(id);

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    if (groupOrder.creator.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the creator can finalize this order" });
    }

    if (groupOrder.status !== "open") {
      return res.status(400).json({ message: "Group order is not open" });
    }

    await recalcGroupTotals(groupOrder);

    const participants = groupOrder.participants;
    const orders = [];

    // Build price map
    const allMenuItemIds = [];
    participants.forEach((p) =>
      p.items.forEach((item) => allMenuItemIds.push(item.menuItem))
    );

    const menuItems = await MenuItem.find({
      _id: { $in: allMenuItemIds },
    }).lean();

    const priceMap = new Map(
      menuItems.map((mi) => [mi._id.toString(), mi.price])
    );

    const computeParticipantSubtotal = (p) => {
      let sub = 0;
      p.items.forEach((item) => {
        const base = priceMap.get(item.menuItem.toString()) || 0;
        const custom = (item.customizations || []).reduce(
          (s, c) => s + (c.price || 0),
          0
        );
        sub += (base + custom) * (item.quantity || 1);
      });
      return sub;
    };

    const participantSubtotals = participants.map(computeParticipantSubtotal);
    const groupSubtotal = participantSubtotals.reduce((a, b) => a + b, 0) || 1;

    participants.forEach((p, index) => {
      const participantSubtotal = participantSubtotals[index];

      const taxShare =
        groupOrder.tax * (participantSubtotal / groupSubtotal);
      const tipShare =
        (groupOrder.tip || 0) *
        (participantSubtotal / groupSubtotal);
      const total = participantSubtotal + taxShare + tipShare;

      orders.push(
        new Order({
          user: p.user,
          items: p.items,
          subtotal: participantSubtotal,
          tax: taxShare,
          tip: tipShare,
          total,
          status: "pending",
        })
      );
    });

    await Order.insertMany(orders);

    groupOrder.status = "completed";
    await groupOrder.save();

    return res.json({
      message: "Group order finalized",
      groupOrder,
      orders,
    });
  } catch (err) {
    console.error("Error finalizing group order:", err);
    return res
      .status(500)
      .json({ message: "Failed to finalize group order" });
  }
};
