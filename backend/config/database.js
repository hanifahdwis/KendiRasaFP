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
      user_id INTEGER, -- Tambahan: Siapa yang bikin (NULL kalau default)
      is_default BOOLEAN DEFAULT 0, -- Tambahan: Penanda rasa bawaan
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating moods table:', err);
    else {
      console.log('Moods table ready');
      db.get('SELECT COUNT(*) as count FROM moods', (err, row) => {
        if (!err && row.count === 0) {
          const defaultMoods = [
            ['Senang', '#F7D046', 1],
            ['Sedih', '#2E5DAE', 1],
            ['Marah', '#D5222A', 1],
            ['Takut', '#A282C4', 1],
            ['Frustasi', '#E66A2B', 1]
          ];

          const stmt = db.prepare('INSERT INTO moods (name, color, is_default) VALUES (?, ?, ?)');
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

  db.run(`
    CREATE TABLE IF NOT EXISTS kendi_rasa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      journal_id INTEGER NOT NULL UNIQUE, 
      user_id INTEGER NOT NULL,
      mood_id INTEGER NOT NULL,
      position_x INTEGER DEFAULT 0,
      position_y INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (mood_id) REFERENCES moods(id)
    )
  `, (err) => {
    if (err) console.error('Error creating kendi_rasa table:', err);
    else console.log('Kendi Rasa table ready');
  });
}

module.exports = db;