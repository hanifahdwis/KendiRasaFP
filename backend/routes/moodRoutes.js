const express = require('express');
const router = express.Router();
const moodController = require('../controllers/moodController');
const authMiddleware = require('../middleware/auth');


router.get('/master', authMiddleware, moodController.getMasterMoods);
router.post('/', authMiddleware, moodController.createButiranRasa);
router.get('/', authMiddleware, moodController.getAllButiranRasa);
router.get('/:id', authMiddleware, moodController.getButiranRasaById);
router.get('/journal/:journalId', authMiddleware, moodController.getButiranRasaByJournalId);
router.put('/mood', authMiddleware, moodController.updateButiranRasaMood);
router.put('/:id/position', authMiddleware, moodController.updateButiranRasaPosition);
router.delete('/journal/:journalId', authMiddleware, moodController.deleteButiranRasaByJournalId);
router.delete('/:id', authMiddleware, moodController.deleteButiranRasa);

module.exports = router;