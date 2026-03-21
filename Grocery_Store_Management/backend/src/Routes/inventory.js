const express = require('express');
const router = express.Router();
const { authenticate } = require('../Middlewares/Auth');
const { getInventory, getInventoryItem, updateLevels, sendReorderAlert, getLowStockItems } = require('../Controllers/inventoryController');

router.use(authenticate);

router.get('/', getInventory);
router.get('/low-stock', getLowStockItems);
router.get('/:id', getInventoryItem);
router.patch('/:id/levels', updateLevels);
router.post('/:id/reorder-alert', sendReorderAlert);

module.exports = router;
