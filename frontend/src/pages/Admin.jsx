import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { Search, Plus } from 'lucide-react';

export default function Admin() {
  const { user } = useContext(AuthContext);
  const [searchTitle, setSearchTitle] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchResults(null);
    setMovieData(null);
    let idToSearch = searchTitle.trim();

    try {
      const res = await axios.get(`${API_URL}/movies/imdb/search?title=${encodeURIComponent(idToSearch)}&t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSearchResults(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to search movies. Please check the title.' });
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMovie = async (imdbId) => {
    setSelecting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await axios.get(`${API_URL}/movies/imdb/scrape?imdbId=${imdbId}&t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMovieData(res.data);
      setSearchResults(null); // Hide search results once a movie is selected
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch movie details.' });
    } finally {
      setSelecting(false);
    }
  };

  const handleSave = async () => {
    if (!youtubeLink) {
      setMessage({ type: 'error', text: 'Please provide a YouTube Link' });
      return;
    }
    
    setSaving(true);
    try {
      await axios.post(`${API_URL}/movies`, {
        ...movieData,
        youtubeLink
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessage({ type: 'success', text: 'Movie added successfully!' });
      setMovieData(null);
      setSearchTitle('');
      setYoutubeLink('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save movie' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-red-600 pl-4">Admin Dashboard</h1>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-green-500/10 border-green-500/50 text-green-400'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-xl mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Movie</h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-grow">
              <input 
                type="text" 
                placeholder="Enter movie title (e.g., Avatar)" 
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading ? 'Searching...' : <><Search className="w-5 h-5" /> Fetch Details</>}
            </button>
          </form>
        </div>

        {searchResults && searchResults.length > 0 && (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-xl mb-8 animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl font-semibold text-white mb-4">Select the correct movie</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2">
              {searchResults.map((result) => (
                <div 
                  key={result.imdbID}
                  onClick={() => handleSelectMovie(result.imdbID)}
                  className={`relative group rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selecting ? 'opacity-50 pointer-events-none' : 'hover:scale-105 border-transparent hover:border-red-500'}`}
                >
                  {result.Poster && result.Poster !== 'N/A' ? (
                    <img src={result.Poster} alt={result.Title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm text-center p-2">No Poster</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3 text-left">
                    <span className="text-white font-medium text-sm leading-tight line-clamp-2">{result.Title}</span>
                    <span className="text-zinc-400 text-xs">{result.Year}</span>
                  </div>
                </div>
              ))}
            </div>
            {selecting && <div className="text-red-500 mt-4 text-center animate-pulse">Fetching full details...</div>}
          </div>
        )}

        {movieData && (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl font-semibold text-white mb-6">Preview & Edit Details</h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-48 shrink-0 rounded-lg overflow-hidden border border-zinc-800 shadow-lg relative h-72">
                 {movieData.posterUrl ? (
                    <img src={movieData.posterUrl} alt="Poster" className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">No Poster</div>
                 )}
              </div>
              
              <div className="flex-grow space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Title</label>
                  <input 
                    type="text" 
                    value={movieData.title}
                    onChange={(e) => setMovieData({...movieData, title: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Genre</label>
                  <input 
                    type="text" 
                    value={movieData.genre}
                    onChange={(e) => setMovieData({...movieData, genre: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Poster URL</label>
                  <input 
                    type="text" 
                    value={movieData.posterUrl}
                    onChange={(e) => setMovieData({...movieData, posterUrl: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                  <textarea 
                    rows="3"
                    value={movieData.description}
                    onChange={(e) => setMovieData({...movieData, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                  ></textarea>
                </div>
                
                <div className="pt-2 border-t border-zinc-800">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">YouTube Video Link</label>
                  <input 
                    type="url" 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                  />
                  <p className="text-xs text-zinc-500 mt-2">Paste the full YouTube URL to the movie video</p>
                </div>
                
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 mt-4 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20"
                >
                  {saving ? 'Saving...' : <><Plus className="w-5 h-5" /> Save to Catalog</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
