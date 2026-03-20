const express = require('express');
const router = express.Router();
const StorefrontProduct = require('../Models/StorefrontProduct');
const InventoryItem = require('../Models/InventoryItem');

// Public route - list all active storefront products
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'All') filter.groceryType = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const [products, total] = await Promise.all([
      StorefrontProduct.find(filter)
        .populate('groceryItem', 'name image description groceryType measuringUnit')
        .sort({ syncedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      StorefrontProduct.countDocuments(filter),
    ]);

    const categories = await StorefrontProduct.distinct('groceryType', { isActive: true });

    res.json({
      success: true,
      data: products,
      total,
      categories: ['All', ...categories.filter(Boolean)],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await StorefrontProduct.findById(req.params.id)
      .populate('groceryItem');
    if (!product || !product.isActive) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Inter-service endpoint to deduct stock after payment
router.post('/deduct', async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid items array' });
    }

    // Process all deductions in parallel
    const deductionPromises = items.map(async (item) => {
      // 1. Deduct from StorefrontProduct
      const updatedStorefront = await StorefrontProduct.findByIdAndUpdate(
        item.id,
        { $inc: { stockQuantity: -item.qty } }, 
        { new: true }
      );

      // 2. If it was linked to an InventoryItem, deduct from there too
      if (updatedStorefront && updatedStorefront.inventoryItem) {
        await InventoryItem.findByIdAndUpdate(
          updatedStorefront.inventoryItem,
          { $inc: { totalQuantity: -item.qty } }
        );
      }
      return updatedStorefront;
    });
    
    await Promise.all(deductionPromises);

    res.json({ success: true, message: 'Stock successfully deducted from Storefront and Inventory' });
  } catch (err) {
    console.error('Deduction failed:', err);
    res.status(500).json({ success: false, message: 'Failed to deduct stock' });
  }
});

module.exports = router;
