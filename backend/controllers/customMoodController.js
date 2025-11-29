const CustomMoodModel = require('../models/customMoodModels');
const isValidHexColor = (color) => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

exports.createCustomMood = (req, res) => {
  const userId = req.userId; 
  const { name, color } = req.body;

  if (!name || !color) {
    return res.status(400).json({ success: false, message: 'Nama dan warna rasa harus diisi' });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Nama rasa minimal 2 karakter' });
  }
  if (!isValidHexColor(color)) {
    return res.status(400).json({ success: false, message: 'Format warna tidak valid (Gunakan Hex #RRGGBB)' });
  }

  CustomMoodModel.create(userId, { name: name.trim(), color }, (err, mood) => {
    if (err) {
      console.error('Error creating custom mood:', err);
      return res.status(400).json({ success: false, message: err.message || 'Gagal membuat rasa baru' });
    }
    res.status(201).json({ success: true, message: 'Rasa baru berhasil ditambahkan', data: mood });
  });
};

exports.getAllMoods = (req, res) => {
  const userId = req.userId;
  CustomMoodModel.getAllByUser(userId, (err, moods) => {
    if (err) return res.status(500).json({ success: false, message: 'Gagal mengambil data rasa' });
    res.json({ success: true, data: moods, total: moods.length });
  });
};

exports.getMoodById = (req, res) => {
  const userId = req.userId;
  const moodId = req.params.id;

  CustomMoodModel.getById(moodId, userId, (err, mood) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (!mood) return res.status(404).json({ success: false, message: 'Rasa tidak ditemukan' });
    res.json({ success: true, data: mood });
  });
};

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

exports.deleteCustomMood = (req, res) => {
  const userId = req.userId;
  const moodId = req.params.id;

  CustomMoodModel.delete(moodId, userId, (err, result) => {
    if (err) return res.status(400).json({ success: false, message: err.message || 'Gagal menghapus' });
    res.json({ success: true, message: 'Rasa berhasil dihapus' });
  });
};