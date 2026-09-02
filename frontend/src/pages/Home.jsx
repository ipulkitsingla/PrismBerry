import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import { Search } from 'lucide-react';

export default function Home() {
  const { user } = useContext(AuthContext);
  const [movies, setMovies] = useState([]);
  const [myList, setMyList] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, profileRes] = await Promise.all([
          axios.get('http://localhost:5000/api/movies'),
          user ? axios.get('http://localhost:5000/api/user/profile', {
            headers: { Authorization: `Bearer ${user.token}` }
          }).catch(() => null) : Promise.resolve(null)
        ]);

        setMovies(moviesRes.data);
        
        if (profileRes && profileRes.data) {
          setMyList(profileRes.data.myList || []);
          setWatchHistory(profileRes.data.watchHistory || []);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {movies.length > 0 && (
             <img 
              src={movies[0].posterUrl} 
              alt="Featured" 
              className="w-full h-full object-cover opacity-30 object-top"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Unlimited <span className="text-red-600">Movies</span>, <br/> TV shows, and more.
          </h1>
          <p className="text-xl text-zinc-300 mb-10">Watch anywhere. Cancel anytime.</p>
          
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-zinc-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by title, character, or genre..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full bg-zinc-900/80 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 backdrop-blur-md shadow-2xl transition-all"
            />
          </div>
        </div>
      </div>

      {/* Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-20">
        
        {/* Watch History Carousel */}
        {user && watchHistory.length > 0 && !search && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white border-l-4 border-red-600 pl-3 mb-6">Continue Watching</h2>
            <div className="flex overflow-x-auto gap-6 pb-4 snap-x no-scrollbar">
              {watchHistory.map(movie => (
                <div key={`history-${movie._id}`} className="w-[150px] md:w-[180px] flex-none snap-start">
                  <MovieCard movie={movie} initialInList={myList.some(m => m._id === movie._id)} />
                </div>
              ))}
            </div>
          </div>
        )}


        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white border-l-4 border-red-600 pl-3">
            {search ? 'Search Results' : 'Popular Titles'}
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map(movie => (
              <MovieCard key={movie._id} movie={movie} initialInList={myList.some(m => m._id === movie._id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 text-lg">No movies found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
