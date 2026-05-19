import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f0f8f4', padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ margin: '0 0 16px 0', fontSize: 36 }}>🟠</span>
          <div>
            <h1 style={{ margin: '12px 0 0 0', color: '#1a5c38' , fontSize: '44px'}}>מערכת שקיות כתומות</h1>
            <p style={{ margin: '12px 0 12px 0', color: '#666' }}>שלום, {user?.name}</p>
          </div>
        </div>
        <button onClick={logout} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>
          יציאה
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div onClick={() => navigate('/dashboard')}
          style={{ background: 'white', borderRadius: '16px', padding: '30px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderTop: '4px solid #1a5c38' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h2 style={{ color: '#1a5c38', margin: '0 0 8px' }}>דשבורד</h2>
          <p style={{ color: '#666', margin: 0 }}>סטטיסטיקות וגרפים</p>
        </div>

        <div onClick={() => navigate('/users')}
          style={{ background: 'white', borderRadius: '16px', padding: '30px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderTop: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <h2 style={{ color: '#3b82f6', margin: '0 0 8px' }}>ניהול משתמשים</h2>
          <p style={{ color: '#666', margin: 0 }}>הוספה, עריכה ונעילה</p>
        </div>

        <div onClick={() => navigate('/dashboard')}
          style={{ background: 'white', borderRadius: '16px', padding: '30px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderTop: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🟠</div>
          <h2 style={{ color: '#f59e0b', margin: '0 0 8px' }}>ניהול מחזורים</h2>
          <p style={{ color: '#666', margin: 0 }}>פתיחה, סגירה וארכיון</p>
        </div>
      </div>
    </div>
  );
};

export default Home;