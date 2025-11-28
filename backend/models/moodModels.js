const db = require('../config/database');

const MoodModel = {
  // CREATE: Tambah butiran rasa saat user buat jurnal
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
        // Return data lengkap dengan info mood
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

  // READ: Get semua butiran rasa milik user (untuk tampil di main page)
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

  // READ: Get butiran rasa by ID (untuk popup detail)
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

  // READ: Get butiran rasa by journal_id (untuk lihat butiran dari jurnal tertentu)
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

  // UPDATE: Update warna butiran rasa saat jurnal diedit
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

  // UPDATE: Update posisi butiran (optional - kalau mau drag & drop)
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

  // DELETE: Hapus butiran rasa saat jurnal dihapus
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

  // DELETE: Hapus butiran rasa by ID
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

  // Fungsi helper untuk generate posisi random butiran
  generateRandomPosition: (callback) => {
    // Posisi dalam persentase (0-100) untuk responsive
    const position = {
      x: Math.floor(Math.random() * 80) + 10, // 10-90% dari lebar kendi
      y: Math.floor(Math.random() * 70) + 10  // 10-80% dari tinggi kendi
    };
    callback(null, position);
  }
};

module.exports = MoodModel;