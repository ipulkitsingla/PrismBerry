import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Film, User, LogOut, Bookmark } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <Film className="h-8 w-8 text-red-600" />
              <span className="text-2xl font-bold text-red-600 tracking-tighter">STREAMFLIX</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-zinc-300 hover:text-white transition-colors">
                    Admin Panel
                  </Link>
                )}
                
                <Link to="/mylist" className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors mr-2">
                  <Bookmark className="h-5 w-5" />
                  <span className="hidden sm:block">My List</span>
                </Link>

                <div className="flex items-center gap-2 text-zinc-300 border-l border-zinc-700 pl-4">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block">{user.email.split('@')[0]}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors rounded-full hover:bg-zinc-800"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link 
                to="/login"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
