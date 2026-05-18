import api from '../api/axios';
import React, { useState, useEffect } from 'react';

const UsersManagement: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users');
                setUsers(response.data);
            } catch (err) {
                setError('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);
    const toggleUserStatus = async (user: any) => {
        try {
            await api.patch(`/users/${user._id}`, { isActive: !user.isActive });
            setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
        } catch (err) {
            setError('Failed to update user status');
        }
    };

    return (
        <div style={{ direction: 'rtl', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>ניהול משתמשים</h1>
                <button style={{ background: '#1a5c38', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ＋ הוסף משתמש
                </button>
            </div>

            {loading ? (
                <p>טוען...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#1a5c38', color: 'white' }}>
                            <th style={{ padding: '10px', textAlign: 'right' }}>שם</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>אימייל</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>תפקיד</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>סוג</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>טלפון</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>שכונות</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>תאריך הקמה</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>כניסה אחרונה</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>סטטוס</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, i) => (
                            <tr key={user._id} style={{ background: i % 2 === 0 ? '#fff' : '#f0f8f4', borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '10px' }}>{user.name}</td>
                                <td style={{ padding: '10px' }}>{user.email}</td>
                                <td style={{ padding: '10px' }}>{user.role}</td>
                                <td style={{ padding: '10px' }}>{user.role === 'superadmin' ? '—' : user.volunteerType || '—'}</td>
                                <td style={{ padding: '10px' }}>{user.phone || '—'}</td>
                                <td style={{ padding: '10px' }}>{user.assignedAreas?.join(', ') || '—'}</td>
                                <td style={{ padding: '10px' }}>{new Date(user.createdAt).toLocaleDateString('he-IL')}</td>
                                <td style={{ padding: '10px' }}>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('he-IL') : '—'}</td>
                                <td style={{ padding: '10px' }}>{user.isActive ? '✅ פעיל' : '🔴 נעול'}</td>
                                <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                                    {user.role !== 'superadmin' && (
                                        <>
                                            <button
                                                onClick={() => toggleUserStatus(user)}
                                                style={{ background: user.isActive ? '#ef4444' : '#1a5c38', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
                                                {user.isActive ? 'נעל' : 'שחרר'}
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowPasswordModal(true); }}
                                                style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
                                                סיסמה
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowAddModal(true); }}
                                                style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
                                                ✏️ עריכה
                                            </button>

                                        </>
                                    )}
                                    {user.role === 'superadmin' && (
                                        <button
                                            onClick={() => { setSelectedUser(user); setShowPasswordModal(true); }}
                                            style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
                                            🔑 סיסמה
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {showAddModal && selectedUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }} onClick={() => { setShowAddModal(false); setSelectedUser(null); }}>
                    <div style={{
                        backgroundColor: '#fff', padding: '24px', borderRadius: '12px',
                        width: '90%', maxWidth: '450px', direction: 'rtl'
                    }} onClick={e => e.stopPropagation()}>

                        <h3 style={{ marginTop: 0, color: '#1a5c38' }}>
                            עריכת משתמש — {selectedUser.name}
                        </h3>

                        {/* שדות משותפים לכולם */}
                        <label style={{ fontWeight: 'bold' }}>שם:</label>
                        <input
                            key={`name-${selectedUser._id}`}
                            defaultValue={selectedUser.name}
                            id="edit-name"
                            style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />

                        <label style={{ fontWeight: 'bold' }}>אימייל:</label>
                        <input
                            key={`email-${selectedUser._id}`}
                            defaultValue={selectedUser.email}
                            id="edit-email"
                            style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />

                        <label style={{ fontWeight: 'bold' }}>טלפון:</label>
                        <input
                            key={`phone-${selectedUser._id}`}
                            defaultValue={selectedUser.phone || ''}
                            id="edit-phone"
                            style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />

                        {/* שדות רק למשתמשים רגילים */}
                        {selectedUser.role === 'user' && (
                            <>
                                <label style={{ fontWeight: 'bold' }}>סוג:</label>
                                <select
                                    key={`type-${selectedUser._id}`}
                                    defaultValue={selectedUser.volunteerType || 'מתנדב'}
                                    id="edit-type"
                                    style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ddd' }}>
                                    <option>מתנדב</option>
                                    <option>עובד תברואה</option>
                                </select>

                                <label style={{ fontWeight: 'bold' }}>שכונות מוקצות:</label>
                                <input
                                    key={`areas-${selectedUser._id}`}
                                    defaultValue={selectedUser.assignedAreas?.join(', ') || ''}
                                    id="edit-areas"
                                    placeholder="למשל: חצבים, מעוף"
                                    style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
                            </>
                        )}

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button
                                onClick={() => { setShowAddModal(false); setSelectedUser(null); }}
                                style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer' }}>
                                ביטול
                            </button>
                            <button
                                onClick={async () => {
                                    const name = (document.getElementById('edit-name') as HTMLInputElement)?.value;
                                    const email = (document.getElementById('edit-email') as HTMLInputElement)?.value;
                                    const phone = (document.getElementById('edit-phone') as HTMLInputElement)?.value;
                                    const body: any = { name, email, phone };

                                    if (selectedUser.role === 'user') {
                                        const volunteerType = (document.getElementById('edit-type') as HTMLSelectElement)?.value;
                                        const areasStr = (document.getElementById('edit-areas') as HTMLInputElement)?.value;
                                        body.volunteerType = volunteerType;
                                        body.assignedAreas = areasStr.split(',').map((s: string) => s.trim()).filter(Boolean);
                                    }

                                    try {
                                        await api.patch(`/users/${selectedUser._id}`, body);
                                        setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, ...body } : u));
                                        setShowAddModal(false);
                                        setSelectedUser(null);
                                    } catch {
                                        alert('שגיאה בעדכון המשתמש');
                                    }
                                }}
                                style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#1a5c38', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                                שמור
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showPasswordModal && selectedUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }} onClick={() => { setShowPasswordModal(false); setSelectedUser(null); }}>
                    <div style={{
                        backgroundColor: '#fff', padding: '24px', borderRadius: '12px',
                        width: '90%', maxWidth: '400px', direction: 'rtl'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, color: '#1a5c38' }}>שינוי סיסמה — {selectedUser.name}</h3>

                        <label style={{ fontWeight: 'bold' }}>סיסמה חדשה:</label>
                        <input type="password" id="new-password"
                            style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />

                        <label style={{ fontWeight: 'bold' }}>אימות סיסמה:</label>
                        <input type="password" id="confirm-password"
                            style={{ width: '100%', padding: '8px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => { setShowPasswordModal(false); setSelectedUser(null); }}
                                style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer' }}>
                                ביטול
                            </button>
                            <button onClick={async () => {
                                const newPass = (document.getElementById('new-password') as HTMLInputElement)?.value;
                                const confirmPass = (document.getElementById('confirm-password') as HTMLInputElement)?.value;
                                if (newPass !== confirmPass) { alert('הסיסמאות לא תואמות!'); return; }
                                if (newPass.length < 6) { alert('סיסמה חייבת להיות לפחות 6 תווים'); return; }
                                try {
                                    await api.patch(`/users/${selectedUser._id}`, { password: newPass });
                                    setShowPasswordModal(false);
                                    setSelectedUser(null);
                                    alert('הסיסמה עודכנה בהצלחה!');
                                } catch {
                                    alert('שגיאה בעדכון הסיסמה');
                                }
                            }}
                                style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#1a5c38', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                                שמור
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};
export default UsersManagement;