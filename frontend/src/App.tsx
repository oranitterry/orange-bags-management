import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyList from './pages/MyList';
import UsersManagement from './pages/UsersManagement';
import Home from './pages/HomePage';
import AddressList from './pages/AddressList';
import aradLogo from './assets/arad-logo.png';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>טוען...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 1000,
        }}>
          <img
            src={aradLogo}
            alt="לוגו עיריית ערד"
            style={{
              width: '80px',
              borderRadius: '8px',
              mixBlendMode: 'multiply',
              background: 'transparent',
            }}
          />
        </div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><HomeRedirect /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/my-list" element={<PrivateRoute><MyList /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><UsersManagement /></PrivateRoute>} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/addresses" element={<PrivateRoute><AddressList /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><UsersManagement /></PrivateRoute>} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/addresses" element={<PrivateRoute><AddressList /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

const HomeRedirect: React.FC = () => {
  const { user } = useAuth();
  // אם role === 'user' → MyList
  // אחרת → Dashboard
  if (user?.role === 'superadmin') return <Navigate to="/home" />;
  if (user?.role === 'admin') return <Navigate to="/dashboard" />;
  return <Navigate to="/my-list" />;
  if (user?.role === 'superadmin') return <Navigate to="/home" />;
  if (user?.role === 'admin') return <Navigate to="/dashboard" />;
  return <Navigate to="/my-list" />;
};

export default App;
