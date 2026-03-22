const InventoryItem = require('../Models/InventoryItem');
const GroceryItem = require('../Models/GroceryItem');
const Notification = require('../Models/Notification');

const getInventory = async (req, res) => {
  try {
    const filter = {};
    if (req.query.groceryType) {
      const items = await GroceryItem.find({ groceryType: req.query.groceryType }).select('_id');
      filter.groceryItem = { $in: items.map(i => i._id) };
    }
    const inventory = await InventoryItem.find(filter)
      .populate({ path: 'groceryItem', select: 'name groceryType image measuringUnit supplier', populate: { path: 'supplier', select: 'businessName' } })
      .populate('preferredSupplier', 'businessName contactPersonName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: inventory.length, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id)
      .populate({ path: 'groceryItem', select: 'name groceryType image measuringUnit description', populate: { path: 'supplier', select: 'businessName contactPersonName email' } })
      .populate('preferredSupplier', 'businessName contactPersonName email phone');
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateLevels = async (req, res) => {
  try {
    const { minLevel, maxLevel, reorderLevel, preferredSupplier } = req.body;
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });

    if (minLevel !== undefined) item.minLevel = Number(minLevel);
    if (maxLevel !== undefined) item.maxLevel = Number(maxLevel);
    if (reorderLevel !== undefined) {
      item.reorderLevel = Number(reorderLevel);
      item.alertSent = false;
    }
    if (preferredSupplier !== undefined) item.preferredSupplier = preferredSupplier;

    await item.save();
    const updated = await InventoryItem.findById(item._id)
      .populate('groceryItem', 'name groceryType measuringUnit image')
      .populate('preferredSupplier', 'businessName contactPersonName email');
    res.json({ success: true, message: 'Levels updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const sendReorderAlert = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id)
      .populate('groceryItem', 'name measuringUnit groceryType')
      .populate('preferredSupplier', 'businessName contactPersonName email');

    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });
    if (!item.preferredSupplier) return res.status(400).json({ success: false, message: 'No preferred supplier set for this item' });

    await Notification.create({
      type: 'reorder_alert',
      title: 'Reorder Request from Admin',
      message: `Admin requests restock of ${item.groceryItem.name}. Current stock: ${item.totalQuantity} ${item.groceryItem.measuringUnit}. Reorder level: ${item.reorderLevel}`,
      forSupplier: item.preferredSupplier._id,
      inventoryItem: item._id,
    });

    item.alertSent = true;
    await item.save();

    res.json({ success: true, message: `Reorder alert sent to ${item.preferredSupplier.businessName}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getLowStockItems = async (req, res) => {
  try {
    const allItems = await InventoryItem.find({ reorderLevel: { $gt: 0 } })
      .populate('groceryItem', 'name groceryType image measuringUnit')
      .populate('preferredSupplier', 'businessName');
    const lowStock = allItems.filter(i => i.totalQuantity <= i.reorderLevel);
    res.json({ success: true, count: lowStock.length, data: lowStock });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getInventory, getInventoryItem, updateLevels, sendReorderAlert, getLowStockItems };
