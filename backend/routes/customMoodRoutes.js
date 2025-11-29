const express = require('express');
const router = express.Router();
const customMoodController = require('../controllers/customMoodController');
const authMiddleware = require('../middleware/auth');
 
router.use(authMiddleware);
router.post('/', customMoodController.createCustomMood);
router.get('/', customMoodController.getAllMoods);
router.get('/:id', customMoodController.getMoodById);
router.put('/:id', customMoodController.updateCustomMood);
router.delete('/:id', customMoodController.deleteCustomMood);

module.exports = router;