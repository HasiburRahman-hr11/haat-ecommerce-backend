const router = require('express').Router();

const { createOrder, getAllOrders, getUserOrders, getMonthlyIncome, updateOrder, getSingleOrder, deleteOrder, deleteManyOrders, getMonthlySales } = require('../controllers/orderController');

const { verifyToken } = require('../middlewares/jwtVerify');

// Get All Order
router.get('/', verifyToken, getAllOrders);

// Get All Order
router.get('/new', verifyToken, getMonthlySales);

// Create New Order
router.post('/create', createOrder);

// Get Income Status
router.get('/income', verifyToken, getMonthlyIncome);

// Update Order 
router.put('/edit/:orderId', verifyToken, updateOrder);

// Get orders by user
router.get('/user/:userId', verifyToken, getUserOrders);

// Delete many orders
router.post('/delete/many', verifyToken, deleteManyOrders);

// Delete Order
router.delete('/delete/:id', verifyToken, deleteOrder);


// Get Single Order
router.get('/:id', getSingleOrder);








module.exports = router;