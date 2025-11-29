// backend/controllers/customMoodController.js
const CustomMoodModel = require('../models/customMoodModels');

// Helper Validasi Warna Hex
const isValidHexColor = (color) => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

// 1. CREATE MOOD
exports.createCustomMood = (req, res) => {
  const userId = req.userId; // Dari token
  const { name, color } = req.body;

  // Validasi Input
  if (!name || !color) {
    return res.status(400).json({ success: false, message: 'Nama dan warna rasa harus diisi' });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Nama rasa minimal 2 karakter' });
  }
  if (!isValidHexColor(color)) {
    return res.status(400).json({ success: false, message: 'Format warna tidak valid (Gunakan Hex #RRGGBB)' });
  }

  // Panggil Model
  CustomMoodModel.create(userId, { name: name.trim(), color }, (err, mood) => {
    if (err) {
      console.error('Error creating custom mood:', err);
      // Kalau errornya dari model (misal nama duplikat), kirim pesan errornya
      return res.status(400).json({ success: false, message: err.message || 'Gagal membuat rasa baru' });
    }
    res.status(201).json({ success: true, message: 'Rasa baru berhasil ditambahkan', data: mood });
  });
};

// 2. GET ALL MOODS
exports.getAllMoods = (req, res) => {
  const userId = req.userId;
  CustomMoodModel.getAllByUser(userId, (err, moods) => {
    if (err) return res.status(500).json({ success: false, message: 'Gagal mengambil data rasa' });
    res.json({ success: true, data: moods, total: moods.length });
  });
};

// 3. GET BY ID (Opsional, buat edit form)
exports.getMoodById = (req, res) => {
  const userId = req.userId;
  const moodId = req.params.id;

  CustomMoodModel.getById(moodId, userId, (err, mood) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (!mood) return res.status(404).json({ success: false, message: 'Rasa tidak ditemukan' });
    res.json({ success: true, data: mood });
  });
};

// 4. UPDATE MOOD
exports.updateCustomMood = (req, res) => {
  const userId = req.userId;
  const moodId = req.params.id;
  const { name, color } = req.body;

  if (!name || !color) return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
  if (!isValidHexColor(color)) return res.status(400).json({ success: false, message: 'Format warna salah' });

  CustomMoodModel.update(moodId, userId, { name: name.trim(), color }, (err, mood) => {
    if (err) return res.status(400).json({ success: false, message: err.message || 'Gagal update' });
    res.json({ success: true, message: 'Rasa berhasil diupdate', data: mood });
  });
};

// 5. DELETE MOOD
exports.deleteCustomMood = (req, res) => {
  const userId = req.userId;
  const moodId = req.params.id;

  CustomMoodModel.delete(moodId, userId, (err, result) => {
    if (err) return res.status(400).json({ success: false, message: err.message || 'Gagal menghapus' });
    res.json({ success: true, message: 'Rasa berhasil dihapus' });
  });
};