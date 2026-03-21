const GrocerySubmission = require('../Models/GrocerySubmission');
const GroceryItem = require('../Models/GroceryItem');
const InventoryItem = require('../Models/InventoryItem');
const Notification = require('../Models/Notification');

const sendToAdmin = async (req, res) => {
  try {
    const { groceryItemId, quantitySent, unitPrice, discountPercent, note } = req.body;

    const item = await GroceryItem.findOne({ _id: groceryItemId, supplier: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Grocery item not found' });
    if (Number(quantitySent) > item.availableQuantity) {
      return res.status(400).json({ success: false, message: `Cannot send more than available quantity (${item.availableQuantity} ${item.measuringUnit})` });
    }

    const discount = Number(discountPercent) || 0;
    const qty = Number(quantitySent);
    const price = Number(unitPrice);
    const totalPrice = qty * price * (1 - discount / 100);

    const submission = await GrocerySubmission.create({
      supplier: req.user._id,
      groceryItem: groceryItemId,
      quantitySent: qty,
      unitPrice: price,
      discountPercent: discount,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      note: note || '',
    });

    await Notification.create({
      type: 'submission_received',
      title: 'New Grocery Submission',
      message: `${req.user.businessName} submitted ${qty} ${item.measuringUnit} of ${item.name}`,
      forAdmin: true,
      submission: submission._id,
    });

    const populated = await GrocerySubmission.findById(submission._id)
      .populate('groceryItem', 'name groceryType measuringUnit image')
      .populate('supplier', 'businessName contactPersonName');

    res.status(201).json({ success: true, message: 'Submission sent to admin', data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMySubmissions = async (req, res) => {
  try {
    const submissions = await GrocerySubmission.find({ supplier: req.user._id })
      .populate('groceryItem', 'name groceryType measuringUnit image')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllSubmissions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.supplier) filter.supplier = req.query.supplier;
    const submissions = await GrocerySubmission.find(filter)
      .populate('groceryItem', 'name groceryType measuringUnit image unitPrice')
      .populate('supplier', 'businessName contactPersonName email')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const submission = await GrocerySubmission.findById(req.params.id)
      .populate('groceryItem', 'name groceryType measuringUnit image unitPrice description')
      .populate('supplier', 'businessName contactPersonName email phone')
      .populate('reviewedBy', 'firstName lastName');
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const acceptSubmission = async (req, res) => {
  try {
    const { quantityAccepted, reviewNote } = req.body;
    const submission = await GrocerySubmission.findById(req.params.id)
      .populate('groceryItem');

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    if (submission.status !== 'pending') return res.status(400).json({ success: false, message: 'Already reviewed' });

    const qtyAccepted = Number(quantityAccepted);
    if (qtyAccepted < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    if (qtyAccepted > submission.quantitySent) {
      return res.status(400).json({ success: false, message: `Cannot accept more than submitted quantity (${submission.quantitySent})` });
    }

    const groceryItem = submission.groceryItem;
    if (qtyAccepted > groceryItem.availableQuantity) {
      return res.status(400).json({ success: false, message: `Supplier only has ${groceryItem.availableQuantity} ${groceryItem.measuringUnit} available` });
    }

    submission.status = 'accepted';
    submission.quantityAccepted = qtyAccepted;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    submission.reviewNote = reviewNote || '';
    submission.isRead = true;
    await submission.save();

    groceryItem.availableQuantity = groceryItem.availableQuantity - qtyAccepted;
    await groceryItem.save();

    let inventoryItem = await InventoryItem.findOne({ groceryItem: groceryItem._id });
    if (inventoryItem) {
      inventoryItem.totalQuantity += qtyAccepted;
      inventoryItem.lastRestockedAt = new Date();
      inventoryItem.alertSent = false;
      await inventoryItem.save();
    } else {
      inventoryItem = await InventoryItem.create({
        groceryItem: groceryItem._id,
        totalQuantity: qtyAccepted,
        measuringUnit: groceryItem.measuringUnit,
        preferredSupplier: submission.supplier,
        lastRestockedAt: new Date(),
      });
    }

    await Notification.create({
      type: 'submission_accepted',
      title: 'Your Submission Was Accepted',
      message: `${qtyAccepted} ${groceryItem.measuringUnit} of ${groceryItem.name} accepted by admin`,
      forSupplier: submission.supplier,
      submission: submission._id,
    });

    await checkReorderLevel(inventoryItem, groceryItem, submission.supplier);

    const updated = await GrocerySubmission.findById(submission._id)
      .populate('groceryItem', 'name groceryType measuringUnit image')
      .populate('supplier', 'businessName contactPersonName')
      .populate('reviewedBy', 'firstName lastName');

    res.json({ success: true, message: 'Submission accepted and inventory updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const rejectSubmission = async (req, res) => {
  try {
    const { reviewNote } = req.body;
    const submission = await GrocerySubmission.findById(req.params.id)
      .populate('groceryItem', 'name measuringUnit');

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    if (submission.status !== 'pending') return res.status(400).json({ success: false, message: 'Already reviewed' });

    submission.status = 'rejected';
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    submission.reviewNote = reviewNote || '';
    submission.isRead = true;
    await submission.save();

    await Notification.create({
      type: 'submission_rejected',
      title: 'Your Submission Was Rejected',
      message: `Your submission of ${submission.groceryItem.name} was rejected${reviewNote ? ': ' + reviewNote : ''}`,
      forSupplier: submission.supplier,
      submission: submission._id,
    });

    res.json({ success: true, message: 'Submission rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const checkReorderLevel = async (inventoryItem, groceryItem, supplierId) => {
  if (
    inventoryItem.reorderLevel > 0 &&
    inventoryItem.totalQuantity <= inventoryItem.reorderLevel &&
    !inventoryItem.alertSent
  ) {
    inventoryItem.alertSent = true;
    await inventoryItem.save();

    await Notification.create({
      type: 'reorder_alert',
      title: 'Reorder Level Reached',
      message: `${groceryItem.name} has reached its reorder level (${inventoryItem.totalQuantity} ${inventoryItem.measuringUnit} remaining). Send alert to supplier?`,
      forAdmin: true,
      inventoryItem: inventoryItem._id,
    });
  }
};

module.exports = {
  sendToAdmin, getMySubmissions, getAllSubmissions,
  getSubmissionById, acceptSubmission, rejectSubmission,
  checkReorderLevel
};
