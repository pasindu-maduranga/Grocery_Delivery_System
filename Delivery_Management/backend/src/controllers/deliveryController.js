// const deliveryService = require('../services/deliveryService');

// class DeliveryController {
//   // Create a new delivery
//   async createDelivery(req, res) {
//     try {
//       const deliveryData = req.body;
//       const delivery = await deliveryService.createDelivery(deliveryData);
//       res.status(201).json(delivery);
//     } catch (error) {
//       console.error('Error creating delivery:', error);
//       res.status(500).json({ error: error.message });
//     }
//   }
  
//   // Assign a driver to a delivery
//   async assignDriver(req, res) {
//     try {
//       const { deliveryId } = req.params;
//       const delivery = await deliveryService.assignDriver(deliveryId);
      
//       // In a real implementation, this would trigger a notification to the driver
      
//       res.status(200).json(delivery);
//     } catch (error) {
//       console.error('Error assigning driver:', error);
//       res.status(500).json({ error: error.message });
//     }
//   }
  
//   // Update delivery status
//   async updateStatus(req, res) {
//     try {
//       const { deliveryId } = req.params;
//       const { status, driverLocation } = req.body;
      
//       const delivery = await deliveryService.updateStatus(deliveryId, status, driverLocation);
      
//       // Emit real-time update to connected clients tracking this delivery
//       req.io.to('delivery:${deliveryId}').emit('status-update', {
//         deliveryId,
//         status: delivery.status,
//         driverLocation: delivery.driverLocation
//       });
      
//       res.status(200).json(delivery);
//     } catch (error) {
//       console.error('Error updating delivery status:', error);
//       res.status(500).json({ error: error.message });
//     }
//   }
  
//   // Update driver location for a delivery
//   async updateDriverLocation(req, res) {
//     try {
//       const { deliveryId } = req.params;
//       const { coordinates } = req.body;
      
//       const delivery = await deliveryService.updateDriverLocation(deliveryId, coordinates);
      
//       // Emit real-time update to connected clients tracking this delivery
//       req.io.to('delivery:${deliveryId}').emit('location-update', {
//         deliveryId,
//         driverLocation: {
//           type: 'Point',
//           coordinates
//         },
//         status: delivery.status
//       });
      
//       res.status(200).json(delivery);
//     } catch (error) {
//       console.error('Error updating driver location:', error);
//       res.status(500).json({ error: error.message });
//     }
//   }
  
//   // Get delivery by ID
//   async getDeliveryById(req, res) {
//     try {
//       const { deliveryId } = req.params;
//       const delivery = await deliveryService.getDeliveryById(deliveryId);
      
//       if (!delivery) {
//         return res.status(404).json({ error: 'Delivery not found' });
//       }
      
//       res.status(200).json(delivery);
//     } catch (error) {
//       console.error('Error getting delivery:', error);
//       res.status(500).json({ error: error.message });
//     }
//   }
  
//   // Rate a delivery
//   async rateDelivery(req, res) {
//     try {
//       const { deliveryId } = req.params;
//       const { rating } = req.body;
      
//       const delivery = await deliveryService.rateDelivery(deliveryId, rating);
      
//       res.status(200).json(delivery);
//     } catch (error) {
//       console.error('Error rating delivery:', error);
//       res.status(500).json({ error: error.message });
//     }
//   }

//   // Get all active deliveries for a driver
//   async getDriverDeliveries(req, res) {
//     try {
//       const { driverId } = req.params;
//       const deliveries = await deliveryService.getDriverDeliveries(driverId);
//       res.status(200).json(deliveries);
//     } catch (error) {
//       console.error('Error getting driver deliveries:', error);
//       res.status(500).json({ error: error.message });
//     }
//   }
// }

// module.exports = new DeliveryController();
const deliveryService = require('../services/deliveryService');

class DeliveryController {
  // Create a new delivery
  async createDelivery(req, res) {
    try {
      const deliveryData = req.body;
      const delivery = await deliveryService.createDelivery(deliveryData);
      res.status(201).json(delivery);
    } catch (error) {
      console.error('Error creating delivery:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Assign a driver to a delivery
  async assignDriver(req, res) {
    try {
      const { deliveryId } = req.params;
      const delivery = await deliveryService.assignDriver(deliveryId);
      
      // In a real implementation, this would trigger a notification to the driver
      
      res.status(200).json(delivery);
    } catch (error) {
      console.error('Error assigning driver:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Update delivery status
  async updateStatus(req, res) {
    try {
      const { deliveryId } = req.params;
      const { status, driverLocation } = req.body;
      
      const delivery = await deliveryService.updateStatus(deliveryId, status, driverLocation);
      
      // Emit real-time update to connected clients tracking this delivery
      req.io.to(`delivery:${deliveryId}`).emit('status-update', {
        deliveryId,
        status: delivery.status,
        driverLocation: delivery.driverLocation
      });
      
      res.status(200).json(delivery);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Update driver location for a delivery
  async updateDriverLocation(req, res) {
    try {
      const { deliveryId } = req.params;
      const { coordinates } = req.body;
      
      const delivery = await deliveryService.updateDriverLocation(deliveryId, coordinates);
      
      // Emit real-time update to connected clients tracking this delivery
      req.io.to(`delivery:${deliveryId}`).emit('location-update', {
        deliveryId,
        driverLocation: {
          type: 'Point',
          coordinates
        },
        status: delivery.status
      });
      
      res.status(200).json(delivery);
    } catch (error) {
      console.error('Error updating driver location:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get delivery by ID
  async getDeliveryById(req, res) {
    try {
      const { deliveryId } = req.params;
      const delivery = await deliveryService.getDeliveryById(deliveryId);
      
      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }
      
      res.status(200).json(delivery);
    } catch (error) {
      console.error('Error getting delivery:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Rate a delivery
  async rateDelivery(req, res) {
    try {
      const { deliveryId } = req.params;
      const { rating } = req.body;
      
      const delivery = await deliveryService.rateDelivery(deliveryId, rating);
      
      res.status(200).json(delivery);
    } catch (error) {
      console.error('Error rating delivery:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all active deliveries for a driver
  async getDriverDeliveries(req, res) {
    try {
      const { driverId } = req.params;
      const deliveries = await deliveryService.getDriverDeliveries(driverId);
      res.status(200).json(deliveries);
    } catch (error) {
      console.error('Error getting driver deliveries:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DeliveryController();