const { createCategory, getAllCategory, updateCategory, getSingleCategory, deleteCategory, deleteManyCategories } = require('../controllers/categoryController');
const { verifyToken } = require('../middlewares/jwtVerify');

const router = require('express').Router();
const upload = require('../middlewares/upload');

// Create new Category
router.post('/create', verifyToken, upload.single('cat-image'), createCategory);

// Update a Category
router.put('/:id', verifyToken, upload.single('cat-image'), updateCategory);

// Delete a Category
router.delete('/:id' , verifyToken , deleteCategory);

// Delete many users
router.post('/delete/many', verifyToken , deleteManyCategories);

// Get Single Category
router.get('/:id' , getSingleCategory);

// Get All Category
router.get('/', getAllCategory);





module.exports = router;