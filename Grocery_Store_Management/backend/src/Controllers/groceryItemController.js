const GroceryItem = require('../Models/GroceryItem');
const { uploadToCloudinary  } = require('../Config/cloudinary');

const getMyItems = async (req, res) => {
  try {
    const items = await GroceryItem.find({ supplier: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.groceryType) filter.groceryType = req.query.groceryType;
    if (req.query.supplier)    filter.supplier    = req.query.supplier;
    const items = await GroceryItem.find(filter)
      .populate('supplier', 'businessName contactPersonName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await GroceryItem.findById(req.params.id)
      .populate('supplier', 'businessName contactPersonName email');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createItem = async (req, res) => {
  try {
    const { name, groceryType, availableQuantity, measuringUnit, unitPrice, description } = req.body;
    let image = null;
    if (req.file) {
      image = await uploadToCloudinary (req.file.buffer, 'grocery-items');
    }
    const item = await GroceryItem.create({
      supplier:          req.user._id,
      name,
      groceryType,
      availableQuantity: Number(availableQuantity),
      measuringUnit,
      unitPrice:         Number(unitPrice),
      description,
      image,
    });
    res.status(201).json({ success: true, message: 'Grocery item created', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await GroceryItem.findOne({ _id: req.params.id, supplier: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const fields = ['name', 'groceryType', 'measuringUnit', 'description'];
    fields.forEach(f => { if (req.body[f] !== undefined) item[f] = req.body[f]; });
    if (req.body.availableQuantity !== undefined) item.availableQuantity = Number(req.body.availableQuantity);
    if (req.body.unitPrice         !== undefined) item.unitPrice         = Number(req.body.unitPrice);
    if (req.body.isActive          !== undefined) item.isActive          = req.body.isActive;
    if (req.file) {
      item.image = await uploadToCloudinary (req.file.buffer, 'grocery-items');
    }
    await item.save();
    res.json({ success: true, message: 'Item updated', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await GroceryItem.findOneAndDelete({ _id: req.params.id, supplier: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyItems, getAllItems, getItemById, createItem, updateItem, deleteItem };
