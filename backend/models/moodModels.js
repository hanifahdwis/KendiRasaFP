const db = require('../config/database');

const MoodModel = {
  create: (kendiRasaData, callback) => {
    const { journal_id, user_id, mood_id, position_x, position_y } = kendiRasaData;
    const query = `
      INSERT INTO kendi_rasa (journal_id, user_id, mood_id, position_x, position_y) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [journal_id, user_id, mood_id, position_x, position_y], function(err) {
      if (err) {
        callback(err, null);
      } else {
        const selectQuery = `
          SELECT kr.*, m.name as mood_name, m.color as mood_color
          FROM kendi_rasa kr
          JOIN moods m ON kr.mood_id = m.id
          WHERE kr.id = ?
        `;
        
        db.get(selectQuery, [this.lastID], (err, row) => {
          if (err) {
            callback(err, null);
          } else {
            callback(null, row);
          }
        });
      }
    });
  },

  getAllByUserId: (userId, callback) => {
    const query = `
      SELECT 
        kr.*,
        m.name as mood_name,
        m.color as mood_color,
        j.content as journal_preview
      FROM kendi_rasa kr
      JOIN moods m ON kr.mood_id = m.id
      JOIN journals j ON kr.journal_id = j.id
      WHERE kr.user_id = ?
      ORDER BY kr.created_at DESC
    `;
    
    db.all(query, [userId], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  },

  getById: (id, callback) => {
    const query = `
      SELECT 
        kr.*,
        m.name as mood_name,
        m.color as mood_color,
        j.content as journal_content,
        j.created_at as journal_date
      FROM kendi_rasa kr
      JOIN moods m ON kr.mood_id = m.id
      JOIN journals j ON kr.journal_id = j.id
      WHERE kr.id = ?
    `;
    
    db.get(query, [id], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  },

  getByJournalId: (journalId, callback) => {
    const query = `
      SELECT 
        kr.*,
        m.name as mood_name,
        m.color as mood_color
      FROM kendi_rasa kr
      JOIN moods m ON kr.mood_id = m.id
      WHERE kr.journal_id = ?
    `;
    
    db.get(query, [journalId], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  },

  updateMood: (journalId, newMoodId, callback) => {
    const query = 'UPDATE kendi_rasa SET mood_id = ?, updated_at = CURRENT_TIMESTAMP WHERE journal_id = ?';
    
    db.run(query, [newMoodId, journalId], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { changes: this.changes });
      }
    });
  },

  updatePosition: (id, positionX, positionY, callback) => {
    const query = 'UPDATE kendi_rasa SET position_x = ?, position_y = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    
    db.run(query, [positionX, positionY, id], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { changes: this.changes });
      }
    });
  },

  deleteByJournalId: (journalId, callback) => {
    const query = 'DELETE FROM kendi_rasa WHERE journal_id = ?';
    
    db.run(query, [journalId], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { changes: this.changes });
      }
    });
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM kendi_rasa WHERE id = ?';
    
    db.run(query, [id], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { changes: this.changes });
      }
    });
  },

  generateRandomPosition: (callback) => {
    const position = {
      x: Math.floor(Math.random() * 80) + 10, 
      y: Math.floor(Math.random() * 70) + 10  
    };
    callback(null, position);
  }
};

module.exports = MoodModel;