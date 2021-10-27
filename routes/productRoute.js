const { createProduct, getAllProducts, updateProduct, deleteProduct, getSingleProduct, getProductByCategory, deleteManyProducts, addProductReview, getCartProducts } = require('../controllers/productController');
const { verifyToken } = require('../middlewares/jwtVerify');
const upload = require('../middlewares/upload');

const router = require('express').Router();

// Get All Product
router.get('/', getAllProducts);


// Get Single Product
router.get('/:id', getSingleProduct);

// Get Products by Category
router.get('/category/:title', getProductByCategory);

// Create a new Product
router.post('/create', verifyToken, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'gallery', maxCount: 6 }]), createProduct);


// Update a Product
router.put('/edit/:id', verifyToken, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'gallery', maxCount: 6 }]), updateProduct)

// Delete Product
router.delete('/:id', verifyToken, deleteProduct);

// Delete many products
router.post('/delete/many', verifyToken, deleteManyProducts);

// Add Product Review
router.put('/review/:id', addProductReview);


// Get Cart Products
router.post('/cartProducts' , getCartProducts);


module.exports = router;