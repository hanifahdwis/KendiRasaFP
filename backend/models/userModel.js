const db = require('../config/database');

const UserModel = {
  create: (userData, callback) => {
    const { name, username, password } = userData;
    const query = `INSERT INTO users (name, username, password) VALUES (?, ?, ?)`;
    
    db.run(query, [name, username, password], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, name, username });
      }
    });
  },

  findByUsername: (username, callback) => {
    const query = `SELECT * FROM users WHERE username = ?`;
    
    db.get(query, [username], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  },

  findById: (id, callback) => {
    const query = `SELECT id, name, username, created_at FROM users WHERE id = ?`;
    
    db.get(query, [id], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  },

  update: (id, updateData, callback) => {
    const { name, username } = updateData;
    const query = `UPDATE users SET name = ?, username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    db.run(query, [name, username, id], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { changes: this.changes });
      }
    });
  },

  updatePassword: (id, hashedPassword, callback) => {
    const query = `UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    db.run(query, [hashedPassword, id], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { changes: this.changes });
      }
    });
  },

  delete: (id, callback) => {
    const query = `DELETE FROM users WHERE id = ?`;
    
    db.run(query, [id], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { changes: this.changes });
      }
    });
  }
};

module.exports = UserModel;