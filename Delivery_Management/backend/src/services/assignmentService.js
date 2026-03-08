// services/assignmentService.js
const Driver = require('../models/Driver');
const driverService = require('./driverService');
const axios = require('axios');

class AssignmentService {
  constructor() {
    this.orderApiUrl = process.env.ORDER_API_URL || 'http://localhost:5001/api/orders';
    this.assignmentInterval = null;
  }

  // Start the periodic assignment process
  startAssignmentProcess(intervalMs = 10000) {
    if (this.assignmentInterval) {
      clearInterval(this.assignmentInterval);
    }
    
    this.assignmentInterval = setInterval(async () => {
      try {
        await this.assignPendingOrders();
      } catch (error) {
        console.error('Error in assignment process:', error);
      }
    }, intervalMs);
    
    console.log(`Order assignment process started with ${intervalMs}ms interval`);
  }

  // Stop the assignment process
  stopAssignmentProcess() {
    if (this.assignmentInterval) {
      clearInterval(this.assignmentInterval);
      this.assignmentInterval = null;
      console.log('Order assignment process stopped');
    }
  }

  // Fetch pending orders from Order Management API
  async fetchPendingOrders() {
    try {
      const response = await axios.get(`${this.orderApiUrl}/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      throw error;
    }
  }

  // Update order status in Order Management API
  async updateOrderStatus(orderId, status, driverId) {
    try {
      const response = await axios.put(`${this.orderApiUrl}/${orderId}/status`, {
        status,
        driverId
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw error;
    }
  }

  // Main function to assign drivers to pending orders
  async assignPendingOrders() {
    try {
      // Get all pending orders
      const pendingOrders = await this.fetchPendingOrders();
      
      if (!pendingOrders || pendingOrders.length === 0) {
        console.log('No pending orders to process');
        return;
      }

      console.log(`Found ${pendingOrders.length} pending order(s) to process`);
      
      // Process each pending order
      for (const order of pendingOrders) {
        // Find nearest available driver
        const restaurantLocation = order.restaurantLocation;
        const drivers = await driverService.findNearestDrivers(restaurantLocation);
        
        if (drivers.length === 0) {
          console.log(`No available drivers found for order ${order._id}`);
          continue;
        }
        
        // Get the nearest driver (first in the result)
        const selectedDriver = drivers[0];
        
        // Update driver availability
        await driverService.updateAvailability(selectedDriver._id, false);
        
        // Update order status to assigned
        await this.updateOrderStatus(order._id, 'driver_assigned', selectedDriver._id);
        
        console.log(`Order ${order._id} assigned to driver ${selectedDriver._id}`);
      }
    } catch (error) {
      console.error('Error assigning pending orders:', error);
      throw error;
    }
  }
}

module.exports = new AssignmentService();