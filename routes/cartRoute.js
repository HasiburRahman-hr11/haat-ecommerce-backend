const { addToCart, removeFullCart, updateCart, getCart, removeSingleItem } = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/jwtVerify');

const router = require('express').Router();

// Add a product to cart
router.post('/add/:userId' , verifyToken , addToCart);

// Remove Single Item from Cart
router.put('/removeSingle/:userId' , verifyToken , removeSingleItem);

// Remove Cart
router.delete('/remove/:userId' , verifyToken , removeFullCart);


// Update Cart
router.put('/update/:userId' , verifyToken , updateCart);

// Get Cart
router.get('/:userId' , verifyToken , getCart);

module.exports = router;