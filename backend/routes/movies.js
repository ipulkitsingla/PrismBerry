const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cheerio = require('cheerio');
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

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get all movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single movie
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Scrape IMDb data (Admin only)
router.get('/imdb/scrape', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { imdbId } = req.query; // e.g. tt1375666
    if (!imdbId) return res.status(400).json({ message: 'imdbId is required' });

    const url = `https://www.imdb.com/title/${imdbId}/`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const $ = cheerio.load(response.data);
    const title = $('h1').text().trim();
    const description = $('span[data-testid="plot-xl"]').text().trim() || $('span[data-testid="plot-l"]').text().trim();
    const posterUrl = $('.ipc-image').attr('src');
    
    // Simplistic genre scraping
    let genres = [];
    $('.ipc-chip-list__scroller a').each((i, el) => {
      const g = $(el).text().trim();
      if (g) genres.push(g);
    });
    const genre = genres.length > 0 ? genres[0] : 'Unknown';

    res.json({ title, description, posterUrl, genre, imdbId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error scraping IMDb' });
  }
});

// Add a new movie (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { imdbId, title, description, posterUrl, genre, youtubeLink } = req.body;
    
    const existing = await Movie.findOne({ imdbId });
    if (existing) return res.status(400).json({ message: 'Movie already exists' });

    const movie = new Movie({ imdbId, title, description, posterUrl, genre, youtubeLink });
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
