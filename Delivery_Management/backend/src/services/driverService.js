const Driver = require('../models/Driver');
const orderIntegrationService = require('./orderIntegrationService');

class DriverService {
  // Get driver by ID
  async getDriverById(driverId) {
    try {
      return await Driver.findById(driverId);
    } catch (error) {
      console.error(`Error getting driver ${driverId}:`, error);
      throw error;
    }
  }
  
  // Find nearest available drivers
  async findNearestDrivers(restaurantLocation, maxDistance = 10000, limit = 5) {
    try {
      // Find drivers who are available
      const drivers = await Driver.find({
        isAvailable: true,
        isActive: true
      }).limit(limit);
      
      return drivers;
    } catch (error) {
      console.error('Error finding nearest drivers:', error);
      throw error;
    }
  }
  
  // Update driver availability status
  async updateAvailability(driverId, isAvailable) {
    try {
      console.log(`[DriverService] Updating driver ${driverId} availability to ${isAvailable}`);
      
      const driver = await Driver.findByIdAndUpdate(
        driverId,
        { isAvailable },
        { new: true }
      );
      
      if (!driver) {
        throw new Error(`Driver with ID ${driverId} not found`);
      }
      
      return driver;
    } catch (error) {
      console.error('Error updating driver availability:', error);
      throw error;
    }
  }
  
  // Update driver location
  async updateLocation(driverId, longitude, latitude) {
    try {
      console.log(`[DriverService] Updating driver ${driverId} location to [${latitude}, ${longitude}]`);
      
      const driver = await Driver.findByIdAndUpdate(
        driverId,
        {
          'currentLocation.longitude': longitude,
          'currentLocation.latitude': latitude,
          'currentLocation.lastUpdated': new Date()
        },
        { new: true }
      );
      
      if (!driver) {
        throw new Error(`Driver with ID ${driverId} not found`);
      }
      
      return driver;
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }
  
  // Accept an order
  async acceptOrder(driverId, orderId) {
    try {
      console.log(`[DriverService] Driver ${driverId} is accepting order ${orderId}`);
      
      const driver = await Driver.findById(driverId);
      
      if (!driver) {
        throw new Error(`Driver with ID ${driverId} not found`);
      }
      
      // Remove from pending assignments
      if (driver.pendingAssignments && driver.pendingAssignments.includes(orderId)) {
        driver.pendingAssignments = driver.pendingAssignments.filter(id => id !== orderId);
      }
      
      // Add to current orders
      if (!driver.currentOrders) driver.currentOrders = [];
      if (!driver.currentOrders.includes(orderId)) {
        driver.currentOrders.push(orderId);
      }
      
      // Update driver record
      await driver.save();
      
      // Update order in Order Management Service
      const driverInfo = {
        name: driver.name || 'Delivery Driver',
        phone: driver.phone || 'N/A',
        vehicleType: driver.vehicleType || 'Car',
        licensePlate: driver.licensePlate || 'N/A'
      };
      
      try {
        const result = await orderIntegrationService.updateOrderDriverAssignment(
          orderId, 
          {
            driverId: driverId,
            assignmentStatus: 'accepted',
            assignmentHistoryUpdate: {
              driverId: driverId,
              status: 'accepted',
              timestamp: new Date()
            },
            driverInfo,
            driverCurrentLocation: driver.currentLocation
          }
        );
        
        console.log(`[DriverService] Order ${orderId} accepted by driver ${driverId}`);
        return { driver, order: result.order };
      } catch (error) {
        console.error(`Error updating order service for order ${orderId}:`, error);
        // Continue even if order service update fails
        return { driver, order: null };
      }
    } catch (error) {
      console.error(`Error accepting order by driver ${driverId}:`, error);
      throw error;
    }
  }
  
  // Reject an order
  async rejectOrder(driverId, orderId, rejectionReason = 'Driver rejected the order') {
    try {
      console.log(`[DriverService] Driver ${driverId} is rejecting order ${orderId}`);
      
      const driver = await Driver.findById(driverId);
      
      if (!driver) {
        throw new Error(`Driver with ID ${driverId} not found`);
      }
      
      // Remove from pending assignments
      if (driver.pendingAssignments && driver.pendingAssignments.includes(orderId)) {
        driver.pendingAssignments = driver.pendingAssignments.filter(id => id !== orderId);
      }
      
      // Update driver record
      await driver.save();
      
      // Update order in Order Management Service
      try {
        const result = await orderIntegrationService.updateOrderDriverAssignment(
          orderId, 
          {
            driverId: driverId,
            assignmentStatus: 'rejected',
            assignmentHistoryUpdate: {
              driverId: driverId,
              status: 'rejected',
              timestamp: new Date(),
              rejectionReason
            }
          }
        );
        
        console.log(`[DriverService] Order ${orderId} rejected by driver ${driverId}`);
        return { driver, order: result.order };
      } catch (error) {
        console.error(`Error updating order service for order ${orderId}:`, error);
        // Continue even if order service update fails
        return { driver, order: null };
      }
    } catch (error) {
      console.error(`Error rejecting order by driver ${driverId}:`, error);
      throw error;
    }
  }
  
  // Complete a delivery
  async completeDelivery(driverId, orderId) {
    try {
      console.log(`[DriverService] Driver ${driverId} is completing delivery for order ${orderId}`);
      
      const driver = await Driver.findById(driverId);
      
      if (!driver) {
        throw new Error(`Driver with ID ${driverId} not found`);
      }
      
      // Remove from current orders
      if (driver.currentOrders && driver.currentOrders.includes(orderId)) {
        driver.currentOrders = driver.currentOrders.filter(id => id !== orderId);
      }
      
      // Update driver record
      await driver.save();
      
      // Update order status in Order Management Service
      try {
        await orderIntegrationService.updateOrderStatus(orderId, 'Delivered');
        console.log(`[DriverService] Order ${orderId} marked as delivered by driver ${driverId}`);
        return { driver };
      } catch (error) {
        console.error(`Error updating order service for order ${orderId}:`, error);
        // Continue even if order service update fails
        return { driver };
      }
    } catch (error) {
      console.error(`Error completing delivery for order ${orderId} by driver ${driverId}:`, error);
      throw error;
    }
  }
  
  // Get pending assignments for a driver
  async getPendingAssignments(driverId) {
    try {
      console.log(`[DriverService] Getting pending assignments for driver ${driverId}`);
      
      const driver = await Driver.findById(driverId);
      
      if (!driver) {
        throw new Error(`Driver with ID ${driverId} not found`);
      }
      
      const pendingAssignmentIds = driver.pendingAssignments || [];
      console.log(`[DriverService] Driver ${driverId} has ${pendingAssignmentIds.length} pending assignment IDs`);
      
      if (pendingAssignmentIds.length === 0) {
        return [];
      }
      
      const pendingAssignments = [];
      
      for (const orderId of pendingAssignmentIds) {
        try {
          const orderDetails = await orderIntegrationService.getOrderById(orderId);
          if (orderDetails && orderDetails.success) {
            pendingAssignments.push(orderDetails.order);
          } else {
            console.log(`[DriverService] No details found for order ${orderId}`);
          }
        } catch (err) {
          console.error(`[DriverService] Error fetching details for order ${orderId}:`, err);
        }
      }
      
      console.log(`[DriverService] Retrieved ${pendingAssignments.length} pending assignments for driver ${driverId}`);
      return pendingAssignments;
    } catch (error) {
      console.error(`[DriverService] Error getting pending assignments for driver ${driverId}:`, error);
      throw error;
    }
  }
  
  // Get current orders for a driver
  async getCurrentOrders(driverId) {
    try {
      console.log(`[DriverService] Getting current orders for driver ${driverId}`);
      
      const driver = await Driver.findById(driverId);
      
      if (!driver) {
        throw new Error(`Driver with ID ${driverId} not found`);
      }
      
      const currentOrderIds = driver.currentOrders || [];
      console.log(`[DriverService] Driver ${driverId} has ${currentOrderIds.length} current order IDs`);
      
      if (currentOrderIds.length === 0) {
        return [];
      }
      
      const currentOrders = [];
      
      for (const orderId of currentOrderIds) {
        try {
          const orderDetails = await orderIntegrationService.getOrderById(orderId);
          if (orderDetails && orderDetails.success) {
            currentOrders.push(orderDetails.order);
          } else {
            console.log(`[DriverService] No details found for order ${orderId}`);
          }
        } catch (err) {
          console.error(`[DriverService] Error fetching details for order ${orderId}:`, err);
        }
      }
      
      console.log(`[DriverService] Retrieved ${currentOrders.length} current orders for driver ${driverId}`);
      return currentOrders;
    } catch (error) {
      console.error(`[DriverService] Error getting current orders for driver ${driverId}:`, error);
      throw error;
    }
  }
}

module.exports = new DriverService();