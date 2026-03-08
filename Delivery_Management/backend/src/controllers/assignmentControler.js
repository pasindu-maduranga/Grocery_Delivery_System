// controllers/assignmentController.js
const assignmentService = require('../services/assignmentService');

class AssignmentController {
  // Start the assignment process
  startAssignment(req, res) {
    try {
      const { intervalMs } = req.body || {};
      assignmentService.startAssignmentProcess(intervalMs);
      res.status(200).json({ message: 'Assignment process started successfully' });
    } catch (error) {
      console.error('Error starting assignment process:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Stop the assignment process
  stopAssignment(req, res) {
    try {
      assignmentService.stopAssignmentProcess();
      res.status(200).json({ message: 'Assignment process stopped successfully' });
    } catch (error) {
      console.error('Error stopping assignment process:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Manually trigger assignment once
  async manualAssignment(req, res) {
    try {
      await assignmentService.assignPendingOrders();
      res.status(200).json({ message: 'Manual assignment completed successfully' });
    } catch (error) {
      console.error('Error during manual assignment:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AssignmentController();