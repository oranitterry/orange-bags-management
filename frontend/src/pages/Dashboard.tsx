import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Stats {
  summary: { pending: number; distributed: number; not_delivered: number; total: number };
  byArea: { _id: { area: string; status: string }; count: number }[];
}

interface Round {
  _id: string;
  name: string;
  status: string;
  year: number;
}

const COLORS = ['#1a5c38', '#f59e0b', '#ef4444', '#6366f1'];

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewRound, setShowNewRound] = useState(false);
  const [newRoundName, setNewRoundName] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchRounds = () => {
    api.get('/rounds').then(res => {
      setRounds(res.data);
      const active = res.data.find((r: Round) => r.status === 'active');
      if (active) setSelectedRound(active._id);
      else if (res.data.length > 0) setSelectedRound(res.data[0]._id);
    });
  };

  useEffect(() => { fetchRounds(); }, []);

  useEffect(() => {
    if (!selectedRound) return;
    setLoading(true);
    api.get(`/rounds/${selectedRound}/stats`)
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, [selectedRound]);

  const createRound = async () => {
    if (!newRoundName.trim()) return;
    setCreating(true);
    try {
      await api.post('/rounds', { name: newRoundName, year: new Date().getFullYear() });
      setShowNewRound(false);
      setNewRoundName('');
      fetchRounds();
    } finally {
      setCreating(false);
    }
  };

  const openRound = async (id: string) => {
    await api.patch(`/rounds/${id}/open`);
    fetchRounds();
  };

  const closeRound = async (id: string) => {
    if (!confirm('לסגור את המחזור?')) return;
    await api.patch(`/rounds/${id}/close`);
    fetchRounds();
  };

  const areaData = React.useMemo(() => {
    if (!stats) return [];
    const map: Record<string, Record<string, number>> = {};
    stats.byArea.forEach(({ _id, count }) => {
      if (!map[_id.area]) map[_id.area] = {};
      map[_id.area][_id.status] = count;
    });
    return Object.entries(map).map(([area, values]) => ({
      area,
      חולק: values.distributed || 0,
      ממתין: values.pending || 0,
      'לא נמסר': values.not_delivered || 0,
    })).sort((a, b) => (b.חולק + b.ממתין) - (a.חולק + a.ממתין));
  }, [stats]);

  const pieData = stats ? [
    { name: 'חולק', value: stats.summary.distributed },
    { name: 'ממתין', value: stats.summary.pending },
    { name: 'לא נמסר', value: stats.summary.not_delivered },
  ].filter(d => d.value > 0) : [];

  const pct = stats && stats.summary.total > 0
    ? Math.round((stats.summary.distributed / stats.summary.total) * 100)
    : 0;

  const currentRound = rounds.find(r => r._id === selectedRound);
  console.log('role:', user?.role);
  return (
    <div style={{ minHeight: '100vh', background: '#f0f8f4', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ background: '#1a5c38', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🟠</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>מערכת שקיות כתומות</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>עיריית ערד — יחידה סביבתית</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14 }}>שלום, {user?.name}</span>
          <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 99 }}>{user?.role}</span>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 16px', cursor: 'pointer' }}>יציאה</button>
          {user?.role === 'superadmin' && (
            <button onClick={() => navigate('/home')}
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer' }}>
              🏠 בית
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* כותרת + כפתורים */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontWeight: 700, color: '#1a5c38', fontSize: 16 }}>מחזור:</label>
            <select value={selectedRound} onChange={e => setSelectedRound(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }}>
              {rounds.map(r => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.status === 'active' ? '🟢 פעיל' : r.status === 'closed' ? '🔴 סגור' : '⚪ טיוטה'})
                </option>
              ))}
            </select>
            {currentRound?.status === 'draft' && (
              <button onClick={() => openRound(currentRound._id)}
                style={{ background: '#1a5c38', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>
                🟢 פתח מחזור
              </button>
            )}
            {currentRound?.status === 'active' && (
              <button onClick={() => closeRound(currentRound._id)}
                style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>
                🔴 סגור מחזור
              </button>
            )}
          </div>
          <button onClick={() => setShowNewRound(true)}
            style={{ background: '#c0561a', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
            ＋ מחזור חדש
          </button>
        </div>

        {/* Modal מחזור חדש */}
        {showNewRound && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 400 }}>
              <h2 style={{ color: '#1a5c38', marginTop: 0 }}>מחזור חלוקה חדש</h2>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>שם המחזור</label>
              <input value={newRoundName} onChange={e => setNewRoundName(e.target.value)}
                placeholder={`${new Date().getFullYear()} — מחזור א'`}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, boxSizing: 'border-box', marginBottom: 24 }} />
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={createRound} disabled={creating}
                  style={{ flex: 1, background: '#1a5c38', color: 'white', border: 'none', borderRadius: 8, padding: 12, cursor: 'pointer', fontWeight: 700 }}>
                  {creating ? 'יוצר...' : 'צור מחזור'}
                </button>
                <button onClick={() => setShowNewRound(false)}
                  style={{ flex: 1, background: '#eee', border: 'none', borderRadius: 8, padding: 12, cursor: 'pointer' }}>
                  ביטול
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', padding: 40, color: '#1a5c38', fontSize: 18 }}>⏳ טוען נתונים...</div>}

        {stats && !loading && (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'סה"כ כתובות', value: stats.summary.total, color: '#1a5c38', icon: '🏠' },
                { label: 'חולק', value: stats.summary.distributed, color: '#1a5c38', icon: '✅' },
                { label: 'ממתין', value: stats.summary.pending, color: '#f59e0b', icon: '⏳' },
                { label: 'לא נמסר', value: stats.summary.not_delivered, color: '#ef4444', icon: '❌' },
              ].map(card => (
                <div key={card.label} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderTop: `4px solid ${card.color}` }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{card.icon}</div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: card.color }}>{card.value.toLocaleString()}</div>
                  <div style={{ color: '#666', fontSize: 14 }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>התקדמות כללית</span>
                <span style={{ fontWeight: 700, fontSize: 20, color: '#1a5c38' }}>{pct}%</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: 99, height: 20, overflow: 'hidden' }}>
                <div style={{ background: `linear-gradient(90deg, #1a5c38, #2e7d52)`, height: '100%', width: `${pct}%`, borderRadius: 99, transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ marginTop: 8, color: '#888', fontSize: 13 }}>
                {stats.summary.distributed.toLocaleString()} מתוך {stats.summary.total.toLocaleString()} כתובות
              </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <h3 style={{ margin: '0 0 16px', color: '#1a5c38' }}>חלוקה לפי שכונה</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="חולק" fill="#1a5c38" />
                    <Bar dataKey="ממתין" fill="#f59e0b" />
                    <Bar dataKey="לא נמסר" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <h3 style={{ margin: '0 0 16px', color: '#1a5c38' }}>התפלגות סטטוסים</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>אין נתונים עדיין</div>
                )}
              </div>
            </div>
          </>
        )}

        {rounds.length === 0 && !loading && (
          <div style={{ background: 'white', borderRadius: 12, padding: 60, textAlign: 'center', color: '#888' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 20, marginBottom: 8, fontWeight: 600 }}>אין מחזורים עדיין</div>
            <div style={{ marginBottom: 24 }}>לחץ על "מחזור חדש" כדי להתחיל</div>
            <button onClick={() => setShowNewRound(true)}
              style={{ background: '#c0561a', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
              ＋ צור מחזור ראשון
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
