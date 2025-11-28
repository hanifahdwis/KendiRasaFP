const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'kendirasa.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    createTables();
  }
});

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table ready');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS moods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating moods table:', err);
    } else {
      console.log('Moods table ready');
      
      db.get('SELECT COUNT(*) as count FROM moods', (err, row) => {
        if (!err && row.count === 0) {
          const defaultMoods = [
            ['Senang', '#F7D046'],
            ['Sedih', '#2E5DAE'],
            ['Marah', '#D5222A'],
            ['Takut', '#A282C4'],
            ['Frustasi', '#E66A2B']
          ];
          
          const stmt = db.prepare('INSERT INTO moods (name, color, icon) VALUES (?, ?, ?)');
          defaultMoods.forEach(mood => stmt.run(mood));
          stmt.finalize();
          console.log('Default moods inserted');
        }
      });
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mood_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (mood_id) REFERENCES moods(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating journals table:', err);
    } else {
      console.log('Journals table ready');
    }
  });
}

module.exports = db;