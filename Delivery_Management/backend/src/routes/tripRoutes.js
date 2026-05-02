const express = require('express');
const router = express.Router();
const tripController = require('../controllers/deliveryTripController');

router.post('/assign', tripController.assignTrip);
router.put('/:id/status', tripController.updateTripStatus);
router.get('/', tripController.getAllTrips);
router.post('/:id/pay', tripController.payTripToPartner);

module.exports = router;
