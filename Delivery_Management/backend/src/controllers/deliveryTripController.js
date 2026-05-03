const DeliveryTrip = require('../models/DeliveryTrip');
const DeliveryPartner = require('../models/DeliveryPartner');

exports.assignTrip = async (req, res) => {
    try {
        const { orderId, deliveryPartnerId, customerDetails, financials } = req.body;
        
        const trip = new DeliveryTrip({
            orderId,
            deliveryPartnerId,
            customerDetails,
            financials
        });
        await trip.save();

        if (req.io) {
            req.io.emit(`new_order_${deliveryPartnerId}`, trip); // Notify specific driver
        }

        res.status(201).json(trip);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.updateTripStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, demandSurgeMultiplier, distanceKm } = req.body;

        const baseUpdate = { status };
        if (status === 'Accepted') baseUpdate['timestamps.acceptedAt'] = new Date();
        if (status === 'PickedUp') baseUpdate['timestamps.pickedUpAt'] = new Date();
        if (status === 'Delivered') baseUpdate['timestamps.deliveredAt'] = new Date();
        
        if (demandSurgeMultiplier || distanceKm) {
            baseUpdate['tripData'] = {
                distanceKm: distanceKm || 0,
                demandSurgeMultiplier: demandSurgeMultiplier || 1.0
            }
        }

        const trip = await DeliveryTrip.findByIdAndUpdate(id, baseUpdate, { new: true });
        
        if (status === 'Delivered') {
            // Update partner's revenue logic simplified
            await DeliveryPartner.findByIdAndUpdate(trip.deliveryPartnerId, {
                $inc: { 'revenue.totalEarned': trip.financials.riderEarning, 'revenue.pendingPayout': trip.financials.riderEarning }
            });
        }

        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getAllTrips = async (req, res) => {
    try {
        const trips = await DeliveryTrip.find().populate('deliveryPartnerId', 'name email phone vehicle');
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.payTripToPartner = async (req, res) => {
    try {
        const { id } = req.params; // Trip ID
        // Stripe integration is mocked here as requested
        const trip = await DeliveryTrip.findById(id);

        if (!trip) return res.status(404).json({ message: "Trip not found" });
        if (trip.financials.paymentStatus === 'Paid') return res.status(400).json({ message: "Already paid" });

        // Simulate Stripe Payment
        const payoutSuccess = true; 

        if (payoutSuccess) {
            trip.financials.paymentStatus = 'Paid';
            await trip.save();

            await DeliveryPartner.findByIdAndUpdate(trip.deliveryPartnerId, {
                $inc: { 'revenue.pendingPayout': -trip.financials.riderEarning }
            });

            res.json({ message: "Payment successful via Stripe", trip });
        } else {
            res.status(400).json({ message: "Payment failed" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
