import Cart from "../models/Cart.js";
import MenuItem from "../models/MenuItem.js";

// GET /api/cart → get current user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate("items.menuItem");

    if (!cart) {
      return res.status(200).json({
        message: "Cart is empty",
        cart: { items: [] },
      });
    }

    res.status(200).json({
      message: "Cart fetched successfully",
      cart,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching cart",
      error: err.message,
    });
  }
};

// POST /api/cart → add, increment, or decrement item
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Normalize input to an array to support bulk add (e.g. for meals)
    const itemsInput = Array.isArray(req.body.items) ? req.body.items : [req.body];

    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    for (const itemData of itemsInput) {
      const { menuItem, quantity, customizations, mealGroupId } = itemData;

      if (!menuItem) {
        if (itemsInput.length === 1) return res.status(400).json({ message: "Menu item ID is required" });
        continue;
      }
      if (typeof quantity !== "number") {
        if (itemsInput.length === 1) return res.status(400).json({ message: "Quantity must be a number" });
        continue;
      }

      // Validate menu item
      const existingMenuItem = await MenuItem.findById(menuItem);
      if (!existingMenuItem) {
        if (itemsInput.length === 1) return res.status(404).json({ message: "Menu item not found" });
        continue;
      }

      // For custom items OR items part of a meal group, always add as new entry (don't stack)
      if ((customizations && customizations.length > 0) || mealGroupId) {
        if (quantity > 0) {
          cart.items.push({ menuItem, quantity, customizations, mealGroupId });
        } else {
          if (itemsInput.length === 1) return res.status(400).json({ message: "Cannot add custom item with negative quantity" });
        }
      } else {
        // Standard item logic (stack same items)
        // Ensure we don't stack with items that have a mealGroupId
        const existingItem = cart.items.find(
          (i) => i.menuItem.toString() === menuItem &&
            (!i.customizations || i.customizations.length === 0) &&
            !i.mealGroupId
        );

        // Update logic (increment/decrement/remove)
        if (existingItem) {
          existingItem.quantity += quantity;

          // Remove if quantity drops to 0 or below
          if (existingItem.quantity <= 0) {
            cart.items = cart.items.filter(
              (i) => !(i.menuItem.toString() === menuItem &&
                (!i.customizations || i.customizations.length === 0) &&
                !i.mealGroupId)
            );
          }
        } else if (quantity > 0) {
          cart.items.push({ menuItem, quantity, customizations: [] });
        } else {
          if (itemsInput.length === 1) return res.status(400).json({ message: "Cannot add negative quantity for new item" });
        }
      }
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate(
      "items.menuItem"
    );

    res.status(200).json({
      message: "Cart updated successfully",
      cart: updatedCart,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating cart",
      error: err.message,
    });
  }
};

// DELETE /api/cart/:itemId → remove specific item by its unique _id
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { menuItemId: itemId } = req.params; // The route param is named menuItemId, but we treat it as item _id

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Filter out the item with the matching _id
    cart.items = cart.items.filter(
      (i) => i._id.toString() !== itemId
    );

    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate(
      "items.menuItem"
    );

    res.status(200).json({
      message: "Item removed successfully",
      cart: updatedCart,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error removing item from cart",
      error: err.message,
    });
  }
};

// One-time cleanup
// DELETE /api/cart/clear → empties the entire cart for current user
// export const clearCart = async (req, res) => {
//     try {
//     const userId = req.user._id; // from JWT middleware
//     const deletedCart = await Cart.findOneAndDelete({ user: userId });

//     if (!deletedCart) {
//       return res.status(404).json({ message: "Cart not found or already deleted" });
//     }

//     res.status(200).json({
//       message: "🗑️ Entire cart deleted successfully",
//       deletedCart,
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Error deleting cart",
//       error: err.message,
//     });
//   }
// };
