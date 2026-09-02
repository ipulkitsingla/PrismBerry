import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';

export default function MyList() {
  const { user } = useContext(AuthContext);
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyList = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setMyList(res.data.myList || []);
      } catch (err) {
        console.error('Failed to fetch my list', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchMyList();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-24 pb-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white border-l-4 border-red-600 pl-4 mb-10">My List</h1>
        
        {myList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {myList.map(movie => (
              <MovieCard key={movie._id} movie={movie} initialInList={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <h2 className="text-2xl font-semibold text-zinc-300 mb-4">Your list is empty</h2>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">
              Save shows and movies to keep track of what you want to watch.
            </p>
            <a href="/" className="bg-white hover:bg-zinc-200 text-black px-6 py-3 rounded-lg font-bold transition-colors">
              Find Something to Watch
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
