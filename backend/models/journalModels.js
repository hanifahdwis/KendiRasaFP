const db = require('../config/database');

const JournalModel = {
  create: (journalData, callback) => {
    const { user_id, mood_id, content } = journalData;
    const query = `
      INSERT INTO journals (user_id, mood_id, content) 
      VALUES (?, ?, ?)
    `;
    
    db.run(query, [user_id, mood_id, content], function(err) {
      if (err) {
        callback(err, null);
      } else {
        JournalModel.getById(this.lastID, callback);
      }
    });
  },

  getAllByUser: (user_id, callback) => {
    const query = `
      SELECT 
        j.id,
        j.user_id,
        j.mood_id,
        j.content,
        j.created_at,
        j.updated_at,
        m.name as mood_name,
        m.color as mood_color
      FROM journals j
      LEFT JOIN moods m ON j.mood_id = m.id
      WHERE j.user_id = ?
      ORDER BY j.created_at DESC
    `;
    
    db.all(query, [user_id], (err, rows) => {
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
        j.id,
        j.user_id,
        j.mood_id,
        j.content,
        j.created_at,
        j.updated_at,
        m.name as mood_name,
        m.color as mood_color
      FROM journals j
      LEFT JOIN moods m ON j.mood_id = m.id
      WHERE j.id = ?
    `;
    
    db.get(query, [id], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  },

  update: (id, user_id, journalData, callback) => {
    const { mood_id, content } = journalData;
    const query = `
      UPDATE journals 
      SET mood_id = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    
    db.run(query, [mood_id, content, id, user_id], function(err) {
      if (err) {
        callback(err, null);
      } else {
        if (this.changes === 0) {
          callback(new Error('Journal not found or unauthorized'), null);
        } else {
          JournalModel.getById(id, callback);
        }
      }
    });
  },

  delete: (id, user_id, callback) => {
    const query = 'DELETE FROM journals WHERE id = ? AND user_id = ?';
    
    db.run(query, [id, user_id], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { changes: this.changes });
      }
    });
  },

  getMoodStats: (user_id, callback) => {
    const query = `
      SELECT 
        m.name as mood_name,
        m.color as mood_color,
        COUNT(j.id) as count
      FROM journals j
      LEFT JOIN moods m ON j.mood_id = m.id
      WHERE j.user_id = ?
      GROUP BY m.id
      ORDER BY count DESC
    `;
    
    db.all(query, [user_id], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  }
};

module.exports = JournalModel;