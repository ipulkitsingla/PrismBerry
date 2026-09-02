const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  imdbId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  posterUrl: {
    type: String,
  },
  genre: {
    type: String,
  },
  youtubeLink: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);
