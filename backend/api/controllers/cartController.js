import Cart from "../models/Cart.js";

// GET /api/cart → current user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.menuItem");
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/cart → add/update item
export const addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) cart = new Cart({ user: req.user.id, items: [] });

    const item = cart.items.find(i => i.menuItem.toString() === menuItemId);
    if (item) item.quantity += quantity;
    else cart.items.push({ menuItem: menuItemId, quantity });

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
