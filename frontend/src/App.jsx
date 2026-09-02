import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Watch from './pages/Watch';
import Admin from './pages/Admin';
import MyList from './pages/MyList';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user?.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          <div className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/mylist" 
                element={
                  <ProtectedRoute>
                    <MyList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/watch/:id" 
                element={
                  <ProtectedRoute>
                    <Watch />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
