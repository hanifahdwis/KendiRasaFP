const db = require('../config/database');

const CustomMoodModel = {
  create: (userId, moodData, callback) => {
    const { name, color } = moodData;
    const checkQuery = `
      SELECT COUNT(*) as count FROM moods 
      WHERE LOWER(name) = LOWER(?) AND (user_id = ? OR is_default = 1)
    `;
    
    db.get(checkQuery, [name, userId], (err, row) => {
      if (err) {
        return callback(err, null);
      }
      
      if (row.count > 0) {
        return callback(new Error('Rasa dengan nama ini sudah ada'), null);
      }
      
      const insertQuery = `
        INSERT INTO moods (name, color, user_id, is_default) 
        VALUES (?, ?, ?, 0)
      `;
      
      db.run(insertQuery, [name, color, userId], function(err) {
        if (err) {
          callback(err, null);
        } else {
          db.get(
            'SELECT * FROM moods WHERE id = ?', 
            [this.lastID], 
            (err, row) => {
              callback(err, row);
            }
          );
        }
      });
    });
  },

  getAllByUser: (userId, callback) => {
    const query = `
      SELECT * FROM moods 
      WHERE is_default = 1 OR user_id = ?
      ORDER BY is_default DESC, created_at ASC
    `;
    
    db.all(query, [userId], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  },

  getById: (id, userId, callback) => {
    const query = `
      SELECT * FROM moods 
      WHERE id = ? AND (is_default = 1 OR user_id = ?)
    `;
    
    db.get(query, [id, userId], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  },

  update: (id, userId, moodData, callback) => {
    const { name, color } = moodData;
    
    const checkQuery = `
      SELECT * FROM moods 
      WHERE id = ? AND user_id = ? AND is_default = 1
    `;
    
    db.get(checkQuery, [id, userId], (err, mood) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!mood) {
        return callback(new Error('Mood tidak ditemukan atau tidak bisa diedit'), null);
      }
      
      const dupCheckQuery = `
        SELECT COUNT(*) as count FROM moods 
        WHERE LOWER(name) = LOWER(?) 
        AND id != ? 
        AND (user_id = ? OR is_default = 1)
      `;
      
      db.get(dupCheckQuery, [name, id, userId], (err, row) => {
        if (err) {
          return callback(err, null);
        }
        
        if (row.count > 0) {
          return callback(new Error('Nama rasa sudah digunakan'), null);
        }
        
        const updateQuery = `
          UPDATE moods 
          SET name = ?, color = ? 
          WHERE id = ? AND user_id = ?
        `;
        
        db.run(updateQuery, [name, color, id, userId], function(err) {
          if (err) {
            callback(err, null);
          } else {
            if (this.changes === 0) {
              callback(new Error('Tidak ada perubahan'), null);
            } else {
              db.get('SELECT * FROM moods WHERE id = ?', [id], (err, row) => {
                callback(err, row);
              });
            }
          }
        });
      });
    });
  },

  delete: (id, userId, callback) => {
    const checkQuery = `
      SELECT * FROM moods 
      WHERE id = ? AND user_id = ? AND is_default = 0
    `;
    
    db.get(checkQuery, [id, userId], (err, mood) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!mood) {
        return callback(new Error('Mood tidak ditemukan atau tidak bisa dihapus'), null);
      }
      
      db.get(
        'SELECT COUNT(*) as count FROM journals WHERE mood_id = ?',
        [id],
        (err, row) => {
          if (err) {
            return callback(err, null);
          }
          
          if (row.count > 0) {
            return callback(
              new Error('Mood tidak bisa dihapus karena sudah digunakan di jurnal'), 
              null
            );
          }
          
          const deleteQuery = 'DELETE FROM moods WHERE id = ? AND user_id = ?';
          
          db.run(deleteQuery, [id, userId], function(err) {
            if (err) {
              callback(err, null);
            } else {
              callback(null, { changes: this.changes });
            }
          });
        }
      );
    });
  }
};

module.exports = CustomMoodModel;