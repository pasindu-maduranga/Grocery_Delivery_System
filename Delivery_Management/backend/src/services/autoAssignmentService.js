const Driver = require('../models/Driver');
const orderIntegrationService = require('./orderIntegrationService');
const { calculateDistance } = require('../utils/distanceCalculator');

class AutoAssignmentService {
  constructor() {
    this.assignmentInterval = null;
    console.log('[AutoAssignmentService] Service initialized');
  }
  
  // Start automated assignment process
  startAutomaticAssignment(intervalMs = 60000) {
    console.log(`[AutoAssignmentService] Starting automatic assignment process with interval: ${intervalMs}ms`);
    
    // Clear any existing interval
    if (this.assignmentInterval) {
      clearInterval(this.assignmentInterval);
    }
    
    // Set up new interval
    this.assignmentInterval = setInterval(async () => {
      try {
        await this.processUnassignedOrders();
      } catch (error) {
        console.error('[AutoAssignmentService] Error in automated assignment process:', error);
      }
    }, intervalMs);
    
    return true;
  }
  
  // Stop the automatic assignment
  stopAutomaticAssignment() {
    console.log('[AutoAssignmentService] Stopping automatic assignment process');
    if (this.assignmentInterval) {
      clearInterval(this.assignmentInterval);
      this.assignmentInterval = null;
    }
    return true;
  }
  
  // Process all unassigned orders
  async processUnassignedOrders() {
    console.log('[AutoAssignmentService] Processing unassigned orders');
    
    try {
      // Get all orders needing a driver - using the real endpoint
      const unassignedOrdersResponse = await orderIntegrationService.getReadyForPickupOrders();
      
      if (!unassignedOrdersResponse.success || !unassignedOrdersResponse.orders.length) {
        console.log('[AutoAssignmentService] No unassigned orders found');
        return;
      }
      
      const unassignedOrders = unassignedOrdersResponse.orders.filter(order => 
        !order.diliveryDriverId || order.driverAssignmentStatus === 'pending' || order.driverAssignmentStatus === 'rejected'
      );
      
      console.log(`[AutoAssignmentService] Found ${unassignedOrders.length} unassigned orders`);
      
      // Get all available drivers from the database
      const availableDrivers = await Driver.find({
        isAvailable: true, 
        isActive: true
      });
      
      console.log(`[AutoAssignmentService] Found ${availableDrivers.length} available drivers`);
      
      if (!availableDrivers.length) {
        console.log('[AutoAssignmentService] No available drivers found');
        return;
      }
      
      // Process each unassigned order
      for (const order of unassignedOrders) {
        await this.assignDriverToOrder(order, availableDrivers);
      }
      
    } catch (error) {
      console.error('[AutoAssignmentService] Error processing unassigned orders:', error);
      throw error;
    }
  }
  
  // Assign a single order to the best driver
  async assignDriverToOrder(order, availableDrivers) {
    console.log(`[AutoAssignmentService] Finding best driver for order: ${order.orderId}`);
    
    try {
      // Skip orders that already have a driver
      if (order.diliveryDriverId && order.driverAssignmentStatus === 'accepted') {
        console.log(`[AutoAssignmentService] Order ${order.orderId} already has a driver assigned`);
        return;
      }
      
      // Get previously rejected driver IDs for this order
      const rejectedDriverIds = order.assignmentHistory 
        ? order.assignmentHistory
            .filter(history => history.status === 'rejected')
            .map(history => history.driverId)
        : [];
      
      console.log(`[AutoAssignmentService] Order ${order.orderId} has been rejected by ${rejectedDriverIds.length} drivers`);
      
      // Filter out drivers who already rejected this order
      const eligibleDrivers = availableDrivers.filter(
        driver => !rejectedDriverIds.includes(driver._id.toString())
      );
      
      if (!eligibleDrivers.length) {
        console.log(`[AutoAssignmentService] No eligible drivers for order ${order.orderId}`);
        return;
      }
      
      console.log(`[AutoAssignmentService] Found ${eligibleDrivers.length} eligible drivers for order ${order.orderId}`);
      
      // Calculate and sort by driver load and proximity
      const rankedDrivers = eligibleDrivers
        .map(driver => {
          // Calculate order load score (fewer orders = better)
          const orderLoadScore = driver.currentOrders ? driver.currentOrders.length : 0;
          
          // Calculate proximity score if we have location data
          let proximityScore = 0;
          if (driver.currentLocation && driver.currentLocation.latitude && driver.currentLocation.longitude) {
            // Assuming restaurant location is in the order
            if (order.restaurantLocation && order.restaurantLocation.latitude && order.restaurantLocation.longitude) {
              proximityScore = calculateDistance(
                driver.currentLocation.latitude,
                driver.currentLocation.longitude,
                order.restaurantLocation.latitude,
                order.restaurantLocation.longitude
              );
            } else {
              // If no restaurant location, use a default central location
              proximityScore = calculateDistance(
                driver.currentLocation.latitude,
                driver.currentLocation.longitude,
                6.9271, // Default latitude (Colombo)
                79.8612  // Default longitude (Colombo)
              );
            }
          } else {
            proximityScore = 999999; // Large number for drivers without location
          }
          
          // Calculate overall score (lower is better)
          const overallScore = (orderLoadScore * 1000) + proximityScore;
          
          return { 
            driver, 
            orderLoadScore,
            proximityScore,
            overallScore
          };
        })
        .sort((a, b) => a.overallScore - b.overallScore);
      
      // Select the best driver
      if (rankedDrivers.length > 0) {
        const bestMatch = rankedDrivers[0];
        const selectedDriver = bestMatch.driver;
        
        console.log(`[AutoAssignmentService] Selected driver ${selectedDriver.name || selectedDriver._id} for order ${order.orderId}`);
        console.log(`[AutoAssignmentService] Driver has ${bestMatch.orderLoadScore} current orders and is ${bestMatch.proximityScore.toFixed(2)}km from restaurant`);
        
        // Assign the order to the driver
        await this.offerOrderToDriver(order, selectedDriver);
      } else {
        console.log(`[AutoAssignmentService] No suitable drivers found for order ${order.orderId}`);
      }
      
    } catch (error) {
      console.error(`[AutoAssignmentService] Error assigning driver to order ${order.orderId}:`, error);
      throw error;
    }
  }
  
  // Offer order to a specific driver
  async offerOrderToDriver(order, driver) {
    console.log(`[AutoAssignmentService] Offering order ${order.orderId} to driver ${driver._id}`);
    
    try {
      // Add to driver's pending assignments
      if (!driver.pendingAssignments) {
        driver.pendingAssignments = [];
      }
      
      // Skip if already in pending assignments
      if (driver.pendingAssignments.includes(order.orderId)) {
        console.log(`[AutoAssignmentService] Order ${order.orderId} already in pending assignments for driver ${driver._id}`);
        return;
      }
      
      driver.pendingAssignments.push(order.orderId);
      await driver.save();
      
      console.log(`[AutoAssignmentService] Added order ${order.orderId} to pending assignments for driver ${driver._id}`);
      
      // Update driver info for order display
      const driverInfo = {
        name: driver.name || 'Delivery Driver',
        phone: driver.phone || 'N/A',
        vehicleType: driver.vehicleType || 'Car',
        licensePlate: driver.licensePlate || 'N/A'
      };
      
      // Update order assignment history in Order Management Service
      const assignmentResult = await orderIntegrationService.updateOrderDriverAssignment(
        order.orderId, 
        {
          driverId: driver._id.toString(),
          assignmentStatus: 'pending',
          assignmentHistoryUpdate: {
            driverId: driver._id.toString(),
            status: 'offered',
            timestamp: new Date()
          },
          driverInfo
        }
      );
      
      console.log(`[AutoAssignmentService] Order service updated with assignment: ${assignmentResult.success}`);
      
      // Emit to socket for real-time notification
      global.io?.to(`driver_${driver._id}`).emit('new_assignment', {
        orderId: order.orderId,
        restaurantName: order.restaurantName,
        customerAddress: order.customer?.address,
        totalAmount: order.totalAmount,
        timestamp: new Date()
      });
      
      return true;
    } catch (error) {
      console.error(`[AutoAssignmentService] Error offering order ${order.orderId} to driver ${driver._id}:`, error);
      throw error;
    }
  }
  
  // Manually run the assignment process once
  async runManualAssignment() {
    console.log('[AutoAssignmentService] Running manual assignment process');
    try {
      await this.processUnassignedOrders();
      return true;
    } catch (error) {
      console.error('[AutoAssignmentService] Error in manual assignment:', error);
      throw error;
    }
  }
}

module.exports = new AutoAssignmentService();