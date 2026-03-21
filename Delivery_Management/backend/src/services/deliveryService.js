// const Delivery = require('../models/Delivery');
// const Driver = require('../models/Driver');
// const driverService = require('./driverService');
// const { calculateDistance, estimateDeliveryTime } = require('../utils/distanceCalculator');

// class DeliveryService {
//   // Create a new delivery request
//   async createDelivery(deliveryData) {
//     try {
//       const delivery = new Delivery({
//         orderId: deliveryData.orderId,
//         restaurantId: deliveryData.restaurantId,
//         restaurantLocation: {
//           type: 'Point',
//           coordinates: deliveryData.restaurantLocation 
//         },
//         customerLocation: {
//           type: 'Point',
//           coordinates: deliveryData.customerLocation
//         },
//         status: 'pending'
//       });
      
//       return await delivery.save();
//     } catch (error) {
//       console.error('Error creating delivery:', error);
//       throw error;
//     }
//   }
  
//   // Assign a driver to a delivery
//   async assignDriver(deliveryId) {
//     try {
//       const delivery = await Delivery.findById(deliveryId);
      
//       if (!delivery) {
//         throw new Error('Delivery not found');
//       }
      
//       if (delivery.status !== 'pending') {
//         throw new Error('Delivery already has a driver or has been cancelled');
//       }
      
//       // Find nearest available drivers
//       const nearestDrivers = await driverService.findNearestDrivers(
//         delivery.restaurantLocation
//       );
      
//       if (nearestDrivers.length === 0) {
//         throw new Error('No drivers available nearby');
//       }
      
//       // Assign the first nearest driver
//       const driver = nearestDrivers[0];
      
//       // Calculate estimated times
//       const restaurantToCustomerDistance = calculateDistance(
//         delivery.restaurantLocation.coordinates,
//         delivery.customerLocation.coordinates
//       );
      
//       const estimatedTime = estimateDeliveryTime(restaurantToCustomerDistance);
      
//       // Update delivery with driver and time estimates
//       delivery.driverId = driver._id;
//       delivery.status = 'driver_assigned';
//       delivery.estimatedPickupTime = new Date(Date.now() + 15*60000); // 15 min from now
//       delivery.estimatedDeliveryTime = new Date(Date.now() + estimatedTime*60000); // Based on distance
      
//       // Update driver availability
//       await driverService.updateAvailability(driver._id, false);
      
//       return await delivery.save();
//     } catch (error) {
//       console.error('Error assigning driver:', error);
//       throw error;
//     }
//   }
  
//   // Update delivery status
//   async updateStatus(deliveryId, status, driverLocation = null) {
//     try {
//       const delivery = await Delivery.findById(deliveryId);
      
//       if (!delivery) {
//         throw new Error('Delivery not found');
//       }
      
//       delivery.status = status;
      
//       // Update timestamps based on status
//       if (status === 'picked_up') {
//         delivery.actualPickupTime = new Date();
//       } else if (status === 'delivered') {
//         delivery.actualDeliveryTime = new Date();
//         // Make driver available again
//         if (delivery.driverId) {
//           await driverService.updateAvailability(delivery.driverId, true);
//         }
//       }
      
//       // Update driver location if provided
//       if (driverLocation && delivery.driverId) {
//         delivery.driverLocation = {
//           type: 'Point',
//           coordinates: driverLocation
//         };
//       }
      
//       return await delivery.save();
//     } catch (error) {
//       console.error('Error updating delivery status:', error);
//       throw error;
//     }
//   }
  
//   // Update driver location for a delivery
//   async updateDriverLocation(deliveryId, coordinates) {
//     try {
//       const delivery = await Delivery.findById(deliveryId);
      
//       if (!delivery) {
//         throw new Error('Delivery not found');
//       }
      
//       if (!delivery.driverId) {
//         throw new Error('No driver assigned to this delivery');
//       }
      
//       delivery.driverLocation = {
//         type: 'Point',
//         coordinates: coordinates
//       };
      
//       // Also update the driver's location in the driver collection
//       await driverService.updateLocation(delivery.driverId, coordinates);
      
//       return await delivery.save();
//     } catch (error) {
//       console.error('Error updating driver location:', error);
//       throw error;
//     }
//   }
  
//   // Get delivery by ID
//   async getDeliveryById(deliveryId) {
//     try {
//       return await Delivery.findById(deliveryId).populate('driverId', 'name phone averageRating');
//     } catch (error) {
//       console.error('Error getting delivery:', error);
//       throw error;
//     }
//   }
  
//   // Rate a delivery
//   async rateDelivery(deliveryId, rating) {
//     try {
//       const delivery = await Delivery.findById(deliveryId);
      
//       if (!delivery) {
//         throw new Error('Delivery not found');
//       }
      
//       if (delivery.status !== 'delivered') {
//         throw new Error('Cannot rate delivery before it is delivered');
//       }
      
//       delivery.rating = rating;
      
//       // Update driver rating if a driver was assigned
//       if (delivery.driverId) {
//         await driverService.addRating(delivery.driverId, delivery.orderId, rating);
//       }
      
//       return await delivery.save();
//     } catch (error) {
//       console.error('Error rating delivery:', error);
//       throw error;
//     }
//   }
// }

// module.exports = new DeliveryService();

const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');
const driverService = require('./driverService');
const { calculateDistance } = require('../utils/distanceCalculator');

class DeliveryService {
  // Create a new delivery request
  async createDelivery(deliveryData) {
    try {
      const delivery = new Delivery({
        orderId: deliveryData.orderId,
        storeId: deliveryData.storeId,
        storeLocation: {
          type: 'Point',
          coordinates: deliveryData.storeLocation 
        },
        customerLocation: {
          type: 'Point',
          coordinates: deliveryData.customerLocation
        },
        status: 'pending'
      });
      
      return await delivery.save();
    } catch (error) {
      console.error('Error creating delivery:', error);
      throw error;
    }
  }
  
  // Assign a driver to a delivery
  async assignDriver(deliveryId) {
    try {
      const delivery = await Delivery.findById(deliveryId);
      
      if (!delivery) {
        throw new Error('Delivery not found');
      }
      
      if (delivery.status !== 'pending') {
        throw new Error('Delivery already has a driver or has been cancelled');
      }
      
      // Find nearest available drivers
      const nearestDrivers = await driverService.findNearestDrivers(
        delivery.storeLocation
      );
      
      if (nearestDrivers.length === 0) {
        throw new Error('No drivers available nearby');
      }
      
      // Assign the first nearest driver
      const driver = nearestDrivers[0];
      
      // Calculate estimated times
      const storeToCustomerDistance = calculateDistance(
        delivery.storeLocation.coordinates[1],
        delivery.storeLocation.coordinates[0],
        delivery.customerLocation.coordinates[1],
        delivery.customerLocation.coordinates[0]
      );
      
      const estimatedTime = Math.ceil((storeToCustomerDistance / 30) * 60); // Assume 30 km/h avg speed
      
      // Update delivery with driver and time estimates
      delivery.driverId = driver._id;
      delivery.status = 'driver_assigned';
      delivery.estimatedPickupTime = new Date(Date.now() + 15*60000); // 15 min from now
      delivery.estimatedDeliveryTime = new Date(Date.now() + estimatedTime*60000); // Based on distance
      
      // Update driver availability
      await driverService.updateAvailability(driver._id, false);
      
      return await delivery.save();
    } catch (error) {
      console.error('Error assigning driver:', error);
      throw error;
    }
  }
  
  // Update delivery status
  async updateStatus(deliveryId, status, driverLocation = null) {
    try {
      const delivery = await Delivery.findById(deliveryId);
      
      if (!delivery) {
        throw new Error('Delivery not found');
      }
      
      delivery.status = status;
      
      // Update timestamps based on status
      if (status === 'picked_up') {
        delivery.actualPickupTime = new Date();
      } else if (status === 'delivered') {
        delivery.actualDeliveryTime = new Date();
        // Make driver available again
        if (delivery.driverId) {
          await driverService.updateAvailability(delivery.driverId, true);
        }
      }
      
      // Update driver location if provided
      if (driverLocation && delivery.driverId) {
        delivery.driverLocation = {
          type: 'Point',
          coordinates: driverLocation
        };
      }
      
      return await delivery.save();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
  }
  
  // Update driver location for a delivery
  async updateDriverLocation(deliveryId, coordinates) {
    try {
      const delivery = await Delivery.findById(deliveryId);
      
      if (!delivery) {
        throw new Error('Delivery not found');
      }
      
      if (!delivery.driverId) {
        throw new Error('No driver assigned to this delivery');
      }
      
      delivery.driverLocation = {
        type: 'Point',
        coordinates: coordinates
      };
      
      // Also update the driver's location in the driver collection
      await driverService.updateLocation(delivery.driverId, coordinates[0], coordinates[1]);
      
      return await delivery.save();
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }
  
  // Get delivery by ID
  async getDeliveryById(deliveryId) {
    try {
      return await Delivery.findById(deliveryId).populate('driverId', 'name phone averageRating');
    } catch (error) {
      console.error('Error getting delivery:', error);
      throw error;
    }
  }
  
  // Rate a delivery
  async rateDelivery(deliveryId, rating) {
    try {
      const delivery = await Delivery.findById(deliveryId);
      
      if (!delivery) {
        throw new Error('Delivery not found');
      }
      
      if (delivery.status !== 'delivered') {
        throw new Error('Cannot rate delivery before it is delivered');
      }
      
      delivery.rating = rating;
      
      return await delivery.save();
    } catch (error) {
      console.error('Error rating delivery:', error);
      throw error;
    }
  }
}

module.exports = new DeliveryService();
