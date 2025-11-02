import MenuItem from "../models/MenuItem.js";

// GET /api/menu → all items
export const getMenu = async (req, res) => {
  try {
    const items = await MenuItem.find({ available: true });
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
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    item.available = false; // make unavailable
    await item.save();

    res.status(200).json({
      message: "🗃️ Menu item archived (soft deleted)",
      item
    });
  } catch (err) {
    res.status(400).json({ message: "Error archiving item", error: err.message });
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

