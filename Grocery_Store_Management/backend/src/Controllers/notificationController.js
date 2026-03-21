const Notification = require('../Models/Notification');

const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ forAdmin: true })
      .populate({ path: 'submission', populate: [{ path: 'groceryItem', select: 'name image groceryType measuringUnit' }, { path: 'supplier', select: 'businessName' }] })
      .populate({ path: 'inventoryItem', populate: { path: 'groceryItem', select: 'name image groceryType' } })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ forAdmin: true, isRead: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSupplierNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ forSupplier: req.user._id })
      .populate({ path: 'submission', populate: { path: 'groceryItem', select: 'name image groceryType measuringUnit' } })
      .populate({ path: 'inventoryItem', populate: { path: 'groceryItem', select: 'name image groceryType measuringUnit' } })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ forSupplier: req.user._id, isRead: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markAdminRead = async (req, res) => {
  try {
    if (req.params.id === 'all') {
      await Notification.updateMany({ forAdmin: true, isRead: false }, { isRead: true });
    } else {
      await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    }
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markSupplierRead = async (req, res) => {
  try {
    if (req.params.id === 'all') {
      await Notification.updateMany({ forSupplier: req.user._id, isRead: false }, { isRead: true });
    } else {
      await Notification.findOneAndUpdate({ _id: req.params.id, forSupplier: req.user._id }, { isRead: true });
    }
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAdminNotifications, getSupplierNotifications, markAdminRead, markSupplierRead };
