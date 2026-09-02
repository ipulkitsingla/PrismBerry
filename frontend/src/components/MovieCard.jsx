import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Check } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import axios from 'axios';

export default function MovieCard({ movie, initialInList = false }) {
  const { user } = useContext(AuthContext);
  const [inList, setInList] = useState(initialInList);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInList(initialInList);
  }, [initialInList]);

  const handleToggleList = async (e) => {
    e.preventDefault(); // Prevent navigating to /watch if clicked
    e.stopPropagation();
    if (!user) return alert('Please login to use My List');
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/user/mylist`, { movieId: movie._id }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setInList(!inList);
    } catch (err) {
      console.error('Failed to toggle my list', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-red-500/20 bg-zinc-900 cursor-pointer">
      <div className="aspect-[2/3] w-full relative">
        <img 
          src={movie.posterUrl} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Top Right Action Button */}
        <button 
          onClick={handleToggleList}
          disabled={loading}
          className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          title={inList ? "Remove from My List" : "Add to My List"}
        >
          {inList ? <Check className="w-5 h-5 text-red-500" /> : <Plus className="w-5 h-5" />}
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-white font-bold text-lg leading-tight mb-1">{movie.title}</h3>
          <p className="text-zinc-300 text-sm mb-3">{movie.genre}</p>
          <Link 
            to={`/watch/${movie._id}`}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            <Play fill="currentColor" className="w-4 h-4" /> Watch Now
          </Link>
        </div>
      </div>
    </div>
  );
}
