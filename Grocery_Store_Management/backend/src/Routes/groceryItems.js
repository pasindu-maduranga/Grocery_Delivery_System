const express    = require('express');
const router     = express.Router();
const { authenticate } = require('../Middlewares/Auth');
const upload     = require('../Config/multer');
const {
  getMyItems,
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require('../Controllers/groceryItemController');

router.use(authenticate);

router.get('/my',  getMyItems);
router.get('/',    getAllItems);
router.get('/:id', getItemById);
router.post('/',   upload.single('image'), createItem);
router.put('/:id', upload.single('image'), updateItem);
router.delete('/:id',                      deleteItem);

module.exports = router;
