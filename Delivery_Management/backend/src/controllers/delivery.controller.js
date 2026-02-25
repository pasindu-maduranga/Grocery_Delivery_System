// @desc   Get delivery service status
// @route  GET /api/delivery/status
const getStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Delivery Service is operational',
  });
};

module.exports = { getStatus };
