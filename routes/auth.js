const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const verifyGoogleToken = require('../utils/verifyGoogleToken');

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'No credential provided' });

    const googleUser = await verifyGoogleToken(credential);

    let user = await User.findOne({ googleId: googleUser.googleId });

    if (!user) {
      user = await User.create(googleUser);
    } else {
      user.name = googleUser.name;
      user.email = googleUser.email;
      user.picture = googleUser.picture;
      await user.save();
    }

    const jwtSecret = process.env.JWT_SECRET_KEY;
    if (!jwtSecret) throw new Error('JWT_SECRET_KEY not configured');

    const token = jwt.sign({ googleId: user.googleId }, jwtSecret, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).json({ user });

  } catch (err) {
    console.error('Auth error:', err);
    res.status(400).json({ message: 'Authentication failed' });
  }
});

router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed' });
  }
});

module.exports = router;
