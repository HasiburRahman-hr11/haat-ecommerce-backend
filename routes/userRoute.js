const { updateUser, deleteUser, getAllUsers , getSingleUser, getUserStats, deleteManyUsers, getNewUsers } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/jwtVerify');

const router = require('express').Router();

// Get All Users
router.get('/' , verifyToken , getAllUsers);

// Get New Users (Monthly)
router.get('/new' , verifyToken , getNewUsers);

// Get User Stats 
router.get('/stats' , verifyToken , getUserStats);

// Get Single User
router.get('/:id' , verifyToken , getSingleUser);

// Update an user
router.put('/edit/:id' , verifyToken , updateUser);

// Delete many users
router.post('/delete/many', verifyToken , deleteManyUsers);

// Delete an User
router.delete('/delete/:id' , verifyToken , deleteUser);

module.exports = router;