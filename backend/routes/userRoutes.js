const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/update-profile', authMiddleware, userController.updateProfile);
router.put('/change-password', authMiddleware, userController.changePassword);
router.delete('/account', authMiddleware, userController.deleteAccount);

module.exports = router;