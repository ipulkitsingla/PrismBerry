import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Search, Plus } from 'lucide-react';

export default function Admin() {
  const { user } = useContext(AuthContext);
  const [imdbId, setImdbId] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!imdbId) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    // Extract ID if full URL is pasted
    let idToSearch = imdbId;
    if (idToSearch.includes('imdb.com/title/')) {
      const match = idToSearch.match(/title\/(tt\d+)/);
      if (match) idToSearch = match[1];
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/movies/imdb/scrape?imdbId=${idToSearch}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMovieData(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch IMDb data. Ensure ID is correct.' });
      setMovieData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!youtubeLink) {
      setMessage({ type: 'error', text: 'Please provide a YouTube Link' });
      return;
    }
    
    setSaving(true);
    try {
      await axios.post('http://localhost:5000/api/movies', {
        ...movieData,
        youtubeLink
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessage({ type: 'success', text: 'Movie added successfully!' });
      setMovieData(null);
      setImdbId('');
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
                placeholder="IMDb URL or ID (e.g., tt1375666)" 
                value={imdbId}
                onChange={(e) => setImdbId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading ? 'Searching...' : <><Search className="w-5 h-5" /> Fetch IMDb</>}
            </button>
          </form>
        </div>

        {movieData && (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl font-semibold text-white mb-6">Preview & Save</h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-48 shrink-0 rounded-lg overflow-hidden border border-zinc-800 shadow-lg relative">
                 {movieData.posterUrl ? (
                    <img src={movieData.posterUrl} alt="Poster" className="w-full h-auto" />
                 ) : (
                    <div className="w-full aspect-[2/3] bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">No Poster</div>
                 )}
              </div>
              
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-white mb-2">{movieData.title}</h3>
                <span className="inline-block px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded mb-4">{movieData.genre}</span>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{movieData.description}</p>
                
                <div className="mb-6">
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
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20"
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
