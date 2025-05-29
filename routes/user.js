const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


router.get('/me', async (req, res) => {
  try {
    console.log('Auth check request received');
    console.log('Cookies:', req.cookies);

    const token = req.cookies.token;

    if (!token) {
      console.log('No token found in cookies');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Token found, verifying...');

    let decoded;
    try {
      const jwtSecret = process.env.JWT_SECRET_KEY;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET_KEY is not configured');
      }

      decoded = jwt.verify(token, jwtSecret);
      console.log('JWT verified successfully:', decoded);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(401).json({ message: 'Invalid token' });
    }

    console.log('Looking for user with googleId:', decoded.googleId);
    const user = await User.findOne({ googleId: decoded.googleId });

    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('User found:', user.email);

    res.json({
      user: {
        googleId: user.googleId,
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
