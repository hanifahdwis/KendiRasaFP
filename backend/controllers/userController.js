const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');



// Register
exports.register = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    UserModel.findByUsername(username, async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          message: 'Username already exists' 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      UserModel.create({ name, username, password: hashedPassword }, (err, user) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: 'Error creating user' 
          });
        }

        const token = jwt.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: { user, token }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};



// Login
exports.login = (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    UserModel.findByUsername(username, async (err, user) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { 
          user: { 
            id: user.id, 
            name: user.name, 
            username: user.username 
          }, 
          token 
        }
      });
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};



// Get Profile
exports.getProfile = (req, res) => {
  UserModel.findById(req.userId, (err, user) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  });
};



// Update Profil
exports.updateProfile = (req, res) => {
  const { name, username } = req.body;

  if (!name || !username) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name and username are required' 
    });
  }

  UserModel.update(req.userId, { name, username }, (err, result) => {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Username already taken' 
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  });
};



// Ubah Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current and new password are required' 
      });
    }

    UserModel.findById(req.userId, async (err, user) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      UserModel.updatePassword(req.userId, hashedPassword, (err, result) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: 'Error updating password' 
          });
        }

        res.status(200).json({
          success: true,
          message: 'Password changed successfully'
        });
      });
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};


// Hapus Akun
exports.deleteAccount = (req, res) => {
  UserModel.delete(req.userId, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  });
};