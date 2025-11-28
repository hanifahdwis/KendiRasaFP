const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.post('/', journalController.createJournal);           
router.get('/', journalController.getAllJournals);           
router.get('/stats', journalController.getMoodStats);        
router.get('/:id', journalController.getJournalById);        
router.put('/:id', journalController.updateJournal);        
router.delete('/:id', journalController.deleteJournal);      

module.exports = router;