const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const journalRoutes = require('./routes/journalRoutes');
const moodRoutes = require('./routes/moodRoutes');
const customMoodRoutes = require('./routes/customMoodRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/kendi-rasa', moodRoutes);
app.use('/api/custom-moods', customMoodRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'KENDIRASA API is running',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Endpoint not found' 
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;