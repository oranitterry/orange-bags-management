import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import aradLogo from '../assets/arad-logo.png';
import amnir from '../assets/amnir.png';

interface SidebarProps {
  selectedRound?: string;
  onNewRound?: () => void;
  onOpenRound?: () => void;
  onCloseRound?: () => void;
  onAddAddress?: () => void;
  roundStatus?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedRound,
  onNewRound,
  onOpenRound,
  onCloseRound,
  onAddAddress,
  roundStatus,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (!selectedRound) { alert('בחר מחזור קודם'); return; }
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/rounds/${selectedRound}/export`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.xlsx';
    a.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet) as any[];
      await api.post('/addresses/import', { addresses: rows });
      alert(`יובאו ${rows.length} כתובות בהצלחה!`);
    } catch {
      alert('שגיאה בייבוא');
    }
  };

  const menuItem = (icon: string, label: string, onClick: () => void, color = '#1a5c38') => (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '12px 16px', cursor: 'pointer', borderRadius: '8px',
      marginBottom: '4px', color: 'white',
      background: 'rgba(255,255,255,0.1)',
      transition: 'background 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{ fontSize: '14px', fontWeight: 600 }}>{label}</span>
    </div>
  );

  return (
    <div style={{
      width: '220px', minHeight: '100vh', background: '#1a5c38',
      padding: '20px 12px', direction: 'rtl', flexShrink: 0,
    }}>

      {/* header עם לוגו ואמניר */}
      <div style={{ textAlign: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)', background: 'transparent', borderRadius: '12px', }}>
        <img src={amnir} alt="אמניר" style={{ width: '100px', display: 'block', margin: '0 auto' }} />
      </div>

      <div style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        🟠 פעולות
      </div>

      {onNewRound && menuItem('＋', 'מחזור חדש', onNewRound)}
      {roundStatus === 'draft' && onOpenRound && menuItem('🟢', 'פתח מחזור', onOpenRound)}
      {roundStatus === 'active' && onCloseRound && menuItem('🔴', 'סגור מחזור', onCloseRound)}
      {menuItem('📋', 'רשימת כתובות', () => navigate('/addresses'))}
      {onAddAddress && menuItem('➕', 'הוסף כתובת', onAddAddress)}
      {menuItem('📤', 'ייצוא Excel', handleExport)}

      <label style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', cursor: 'pointer', borderRadius: '8px',
        marginBottom: '4px', color: 'white',
        background: 'rgba(255,255,255,0.1)',
      }}>
        <span style={{ fontSize: '18px' }}>📥</span>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>ייבוא Excel</span>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleImport} style={{ display: 'none' }} />
      </label>

      {user?.role === 'superadmin' && menuItem('👥', 'ניהול משתמשים', () => navigate('/users'))}
    </div>
  );
};

export default Sidebar;