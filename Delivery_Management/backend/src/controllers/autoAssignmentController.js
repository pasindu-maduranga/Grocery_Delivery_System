const autoAssignmentService = require('../services/autoAssignmentService');

exports.startAssignment = async (req, res) => {
  try {
    await autoAssignmentService.startAutomaticAssignment();
    res.status(200).json({ message: 'Auto assignment started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.stopAssignment = async (req, res) => {
  try {
    await autoAssignmentService.stopAutomaticAssignment();
    res.status(200).json({ message: 'Auto assignment stopped' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.manualAssignment = async (req, res) => {
  try {
    await autoAssignmentService.processUnassignedOrders();
    res.status(200).json({ message: 'Manual assignment completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};