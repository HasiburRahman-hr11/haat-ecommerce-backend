const { signUpControl, signInControl } = require('../controllers/authController');

const router = require('express').Router();

// Sign Up Route
router.post('/signup' , signUpControl);

// Sign In Route
router.post('/signin' , signInControl );

module.exports = router;