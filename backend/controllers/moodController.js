const MoodModel = require('../models/moodModels'); 

exports.createButiranRasa = (req, res) => {
  const randomX = Math.floor(Math.random() * 80) + 10; 
  const randomY = Math.floor(Math.random() * 60) + 20; 

  const data = {
    journal_id: req.body.journal_id,
    user_id: req.userId,
    mood_id: req.body.mood_id,
    position_x: randomX,
    position_y: randomY
  };

  MoodModel.create(data, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Gagal membuat butiran rasa' });
    res.status(201).json({ success: true, data: result });
  });
};

exports.getAllButiranRasa = (req, res) => {
  MoodModel.getAllByUserId(req.userId, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, data: rows });
  });
};

exports.getButiranRasaById = (req, res) => {
  MoodModel.getById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (!row) return res.status(404).json({ success: false, message: 'Butiran tidak ditemukan' });
    res.json({ success: true, data: row });
  });
};


exports.getButiranRasaByJournalId = (req, res) => {
  MoodModel.getByJournalId(req.params.journalId, (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, data: row });
  });
};

exports.updateButiranRasaMood = (req, res) => {
  const { journal_id, mood_id } = req.body;
  MoodModel.updateMood(journal_id, mood_id, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Gagal update warna butiran' });
    res.json({ success: true, message: 'Warna butiran berhasil diubah' });
  });
};

exports.updateButiranRasaPosition = (req, res) => {
  const { x, y } = req.body;
  MoodModel.updatePosition(req.params.id, x, y, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Gagal geser bola' });
    res.json({ success: true, message: 'Posisi tersimpan' });
  });
};

exports.deleteButiranRasaByJournalId = (req, res) => {
  MoodModel.deleteByJournalId(req.params.journalId, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus butiran' });
    res.json({ success: true, message: 'Butiran rasa pecah/hilang' });
  });
};

exports.deleteButiranRasa = (req, res) => {
  MoodModel.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus butiran' });
    res.json({ success: true, message: 'Butiran rasa pecah/hilang' });
  });
};

exports.getMasterMoods = (req, res) => {
  const query = 'SELECT * FROM moods ORDER BY id ASC';
  const db = require('../config/database'); 
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, data: rows });
  });
};