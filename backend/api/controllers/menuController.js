import mongoose from "mongoose";
import MenuItem from "../models/MenuItem.js";
import Cart from "../models/Cart.js";

// GET /api/menu → all items
// export const getMenu = async (req, res) => {
//   try {
//     const items = await MenuItem.find({ available: true });
//     res.status(200).json(items);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// GET /api/menu → all items (or available only)
export const getMenu = async (req, res) => {
  try {
    const showAll = req.query.all === "true"; // 👈 added line
    const items = showAll
      ? await MenuItem.find().sort({ name: 1 })
      : await MenuItem.find({ available: true }).sort({ name: 1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/menu → add new (admin only)
export const addMenuItem = async (req, res) => {
  try {
    const { name, price, category, available } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    const newItem = await MenuItem.create({
      name,
      price,
      category,
      available: available ?? true, // default to true if not passed
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/menu/:id → update (admin only)
export const updateMenuItem = async (req, res) => {
  try {
    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/menu/:id → delete (admin only)
export const deleteMenuItem = async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({ message: "Menu item deleted successfully", deletedItem });
  } catch (err) {
    res.status(400).json({ message: "Error deleting item", error: err.message });
  }
};

// PATCH /api/menu/:id/archive → mark item as unavailable
export const softDeleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }

    // ✅ Find the menu item
    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // ✅ Mark it unavailable
    item.available = false;
    await item.save();

    // ✅ Remove this item from all carts that contain it
    const result = await Cart.updateMany(
      { "items.menuItem": item._id },
      { $pull: { items: { menuItem: item._id } } }
    );

    console.log(`🛒 Removed from ${result.modifiedCount} cart(s)`);

    // ✅ Send success response
    res.status(200).json({
      message: `🗃️ '${item.name}' archived and removed from ${result.modifiedCount} cart(s)`,
      item,
    });
  } catch (err) {
    console.error("❌ Error in softDeleteMenuItem:", err);
    res.status(500).json({
      message: "Error archiving item",
      error: err.message,
    });
  }
};

// PATCH /api/menu/:id/restore → make available again
export const restoreMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    item.available = true;
    await item.save();

    res.status(200).json({
      message: "✅ Menu item restored and available again",
      item
    });
  } catch (err) {
    res.status(400).json({ message: "Error restoring item", error: err.message });
  }
};

