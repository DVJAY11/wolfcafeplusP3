import Cart from "../models/Cart.js";
import MenuItem from "../models/MenuItem.js";

// GET /api/cart → get current user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
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
    const userId = req.user._id;
    const { menuItem, quantity } = req.body;

    if (!menuItem) return res.status(400).json({ message: "Menu item ID is required" });
    if (typeof quantity !== "number")
      return res.status(400).json({ message: "Quantity must be a number" });

    // Validate menu item
    const existingMenuItem = await MenuItem.findById(menuItem);
    if (!existingMenuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    // Check for existing item
    const existingItem = cart.items.find(
      (i) => i.menuItem.toString() === menuItem
    );

    // Update logic (increment/decrement/remove)
    if (existingItem) {
      existingItem.quantity += quantity;

      // Remove if quantity drops to 0 or below
      if (existingItem.quantity <= 0) {
        cart.items = cart.items.filter(
          (i) => i.menuItem.toString() !== menuItem
        );
      }
    } else if (quantity > 0) {
      cart.items.push({ menuItem, quantity });
    } else {
      return res
        .status(400)
        .json({ message: "Cannot add negative quantity for new item" });
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

// DELETE /api/cart/:menuItemId → remove specific item
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { menuItemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.menuItem.toString() !== menuItemId
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
