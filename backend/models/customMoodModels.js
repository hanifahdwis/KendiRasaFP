const db = require('../config/database');

const CustomMoodModel = {
  // CREATE: Tambah rasa baru
  create: (userId, moodData, callback) => {
    const { name, color } = moodData;
    
    // Validasi: cek apakah nama sudah ada untuk user ini
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
      
      // Insert mood baru
      const insertQuery = `
        INSERT INTO moods (name, color, user_id, is_default) 
        VALUES (?, ?, ?, 0)
      `;
      
      db.run(insertQuery, [name, color, userId], function(err) {
        if (err) {
          callback(err, null);
        } else {
          // Return data mood yang baru dibuat
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

  // READ: Ambil semua rasa (default + custom user)
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

  // READ: Ambil detail 1 mood by ID
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

  // UPDATE: Edit rasa custom (hanya bisa edit yang bukan default)
  update: (id, userId, moodData, callback) => {
    const { name, color } = moodData;
    
    // Cek apakah mood ini milik user dan bukan default
    const checkQuery = `
      SELECT * FROM moods 
      WHERE id = ? AND user_id = ? AND is_default = 0
    `;
    
    db.get(checkQuery, [id, userId], (err, mood) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!mood) {
        return callback(new Error('Mood tidak ditemukan atau tidak bisa diedit'), null);
      }
      
      // Cek apakah nama baru sudah dipakai
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
        
        // Update mood
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
              // Return updated mood
              db.get('SELECT * FROM moods WHERE id = ?', [id], (err, row) => {
                callback(err, row);
              });
            }
          }
        });
      });
    });
  },

  // DELETE: Hapus rasa custom
  delete: (id, userId, callback) => {
    // Cek apakah mood ini milik user dan bukan default
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
      
      // Cek apakah mood ini digunakan di journal
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
          
          // Hapus mood
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