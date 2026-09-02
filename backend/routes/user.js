const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Movie = require('../models/Movie');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secretkey');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Get User Profile (populated with movies)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('myList')
      .populate('watchHistory')
      .select('-password');
      
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle movie in My List
router.post('/mylist', verifyToken, async (req, res) => {
  try {
    const { movieId } = req.body;
    if (!movieId) return res.status(400).json({ message: 'Movie ID required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const movieIndex = user.myList.indexOf(movieId);
    let added = false;

    if (movieIndex > -1) {
      // Movie exists in list, remove it
      user.myList.splice(movieIndex, 1);
    } else {
      // Movie doesn't exist, add it
      user.myList.push(movieId);
      added = true;
    }

    await user.save();
    res.json({ message: added ? 'Added to My List' : 'Removed from My List', myList: user.myList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to Watch History
router.post('/history', verifyToken, async (req, res) => {
  try {
    const { movieId } = req.body;
    if (!movieId) return res.status(400).json({ message: 'Movie ID required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove if it already exists so we can move it to the front
    const existingIndex = user.watchHistory.indexOf(movieId);
    if (existingIndex > -1) {
      user.watchHistory.splice(existingIndex, 1);
    }

    // Add to the front of the array (most recently watched first)
    user.watchHistory.unshift(movieId);

    // Keep history reasonably sized (e.g., last 20 movies)
    if (user.watchHistory.length > 20) {
      user.watchHistory = user.watchHistory.slice(0, 20);
    }

    await user.save();
    res.json({ message: 'Added to Watch History' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
