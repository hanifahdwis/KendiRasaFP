const MoodModel = require('../models/moodModel');

// Get semua moods (untuk dropdown/pilihan)
exports.getAllMoods = (req, res) => {
  MoodModel.getAll((err, moods) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }
    
    res.json({
      success: true,
      data: moods
    });
  });
};

// Get mood by ID
exports.getMoodById = (req, res) => {
  const moodId = req.params.id;
  
  MoodModel.getById(moodId, (err, mood) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }
    
    if (!mood) {
      return res.status(404).json({
        success: false,
        message: 'Mood not found'
      });
    }
    
    res.json({
      success: true,
      data: mood
    });
  });
};

// GET Master Moods (5 butiran pilihan di samping kendi)
exports.getMasterMoods = (req, res) => {
  const query = 'SELECT * FROM moods ORDER BY id ASC';
  
  const db = require('../config/database');
  
  db.all(query, [], (err, moods) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }
    
    res.json({
      success: true,
      data: moods
    });
  });
};

// Create mood baru (Admin only - opsional)
exports.createMood = (req, res) => {
  const { name, color, icon } = req.body;
  
  if (!name || !color) {
    return res.status(400).json({
      success: false,
      message: 'Name and color are required'
    });
  }
  
  MoodModel.create({ name, color, icon }, (err, mood) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error creating mood'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Mood created successfully',
      data: mood
    });
  });
};

// Update mood
exports.updateMood = (req, res) => {
  const moodId = req.params.id;
  const { name, color, icon } = req.body;
  
  if (!name || !color) {
    return res.status(400).json({
      success: false,
      message: 'Name and color are required'
    });
  }
  
  MoodModel.update(moodId, { name, color, icon }, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error updating mood'
      });
    }
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mood not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Mood updated successfully'
    });
  });
};

// Delete mood
exports.deleteMood = (req, res) => {
  const moodId = req.params.id;
  
  MoodModel.delete(moodId, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting mood'
      });
    }
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mood not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Mood deleted successfully'
    });
  });
};