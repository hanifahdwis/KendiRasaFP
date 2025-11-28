const JournalModel = require('../models/journalModels');

exports.createJournal = (req, res) => {
  const user_id = req.userId; 
  const { mood_id, content } = req.body;
  
  if (!mood_id || !content) {
    return res.status(400).json({
      success: false,
      message: 'Mood and content are required'
    });
  }
  
  if (content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Content cannot be empty'
    });
  }
  
  JournalModel.create({ user_id, mood_id, content }, (err, journal) => {
    if (err) {
      console.error('Error creating journal:', err);
      return res.status(500).json({
        success: false,
        message: 'Error creating journal'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Journal created successfully',
      data: journal
    });
  });
};

exports.getAllJournals = (req, res) => {
  const user_id = req.userId;
  
  JournalModel.getAllByUser(user_id, (err, journals) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }
    
    res.json({
      success: true,
      data: journals,
      total: journals.length
    });
  });
};

exports.getJournalById = (req, res) => {
  const user_id = req.userId;
  const journal_id = req.params.id;
  
  JournalModel.getById(journal_id, (err, journal) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found'
      });
    }
    
    if (journal.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    res.json({
      success: true,
      data: journal
    });
  });
};

exports.updateJournal = (req, res) => {
  const user_id = req.userId;
  const journal_id = req.params.id;
  const { mood_id, content } = req.body;
  
  if (!mood_id || !content) {
    return res.status(400).json({
      success: false,
      message: 'Mood and content are required'
    });
  }
  
  JournalModel.update(journal_id, user_id, { mood_id, content }, (err, journal) => {
    if (err) {
      if (err.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Journal not found or unauthorized'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error updating journal'
      });
    }
    
    res.json({
      success: true,
      message: 'Journal updated successfully',
      data: journal
    });
  });
};

exports.deleteJournal = (req, res) => {
  const user_id = req.userId;
  const journal_id = req.params.id;
  
  JournalModel.delete(journal_id, user_id, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting journal'
      });
    }
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found or unauthorized'
      });
    }
    
    res.json({
      success: true,
      message: 'Journal deleted successfully'
    });
  });
};

exports.getMoodStats = (req, res) => {
  const user_id = req.userId;
  
  JournalModel.getMoodStats(user_id, (err, stats) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }
    
    res.json({
      success: true,
      data: stats
    });
  });
};