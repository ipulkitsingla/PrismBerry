import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import YouTube from 'react-youtube';
import { ArrowLeft } from 'lucide-react';

export default function Watch() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/movies/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setMovie(res.data);
      } catch (err) {
        setError('Failed to load movie');
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id, user.token]);

  // Extract video ID from standard YouTube URL
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  );

  if (error || !movie) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white flex-col gap-4">
      <p className="text-xl">{error}</p>
      <Link to="/" className="text-red-500 hover:underline">Return to Browse</Link>
    </div>
  );

  const videoId = getYouTubeId(movie.youtubeLink);

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className="min-h-screen bg-black flex flex-col pt-0">
      {/* Top bar */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-4">
        <Link to="/" className="text-white hover:text-red-500 transition-colors">
          <ArrowLeft className="w-8 h-8" />
        </Link>
        <h1 className="text-white text-xl font-medium drop-shadow-md">{movie.title}</h1>
      </div>
      
      {/* Video Player */}
      <div className="flex-grow relative h-screen w-full">
        {videoId ? (
          <div className="absolute inset-0 w-full h-full">
             <YouTube 
                videoId={videoId} 
                opts={opts} 
                className="w-full h-full"
                iframeClassName="w-full h-full"
             />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Invalid Video Link
          </div>
        )}
      </div>
      
      {/* Movie Details (below fold if they scroll) */}
      <div className="bg-zinc-950 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-8">
            <img 
              src={movie.posterUrl} 
              alt={movie.title} 
              className="w-32 rounded-lg shadow-lg hidden md:block" 
            />
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{movie.title}</h2>
              <span className="inline-block px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full mb-4 font-semibold uppercase tracking-wider">
                {movie.genre}
              </span>
              <p className="text-zinc-400 text-lg leading-relaxed">{movie.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
