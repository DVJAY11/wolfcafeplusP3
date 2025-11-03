import Cart from "../models/Cart.js";
import MenuItem from "../models/MenuItem.js";

// GET /api/cart → current user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate("items.menuItem");

    if (!cart) {
      return res.status(200).json({ message: "Cart is empty", cart: { items: [] } });
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart", error: err.message });
  }
};

// POST /api/cart → add/update item
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id; // from JWT middleware
    const { menuItem, quantity } = req.body;

    // 1️⃣ Validate menu item ID
    const existingMenuItem = await MenuItem.findById(menuItem);
    if (!existingMenuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // 2️⃣ Find user's cart or create a new one
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    // 3️⃣ Check if this item already exists
    const existingItem = cart.items.find(
      (item) => item.menuItem.toString() === menuItem
    );

    // 4️⃣ Update quantity or push new item
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({ menuItem, quantity: quantity || 1 });
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate("items.menuItem");

    res.status(200).json({
      message: existingItem
        ? "Item quantity updated in cart"
        : "Item added to cart",
      cart: updatedCart,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error adding to cart",
      error: err.message,
    });
  }
};

// DELETE /api/cart/:menuItemId → remove item
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(i => i.menuItem.toString() !== req.params.menuItemId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
