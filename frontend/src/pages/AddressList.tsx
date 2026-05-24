import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AddressList: React.FC = () => {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [filterArea, setFilterArea] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/addresses');
                setAddresses(response.data);
            } catch (err) {
                setError('שגיאה בטעינת הכתובות');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (

        <div style={{ direction: 'rtl', padding: '20px' }}>
            <h1>רשימת כתובות</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => navigate('/dashboard')}
                    style={{ background: '#1a5c38', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>
                    🏠 דשבורד
                </button>
                <button onClick={logout}
                    style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>
                    יציאה
                </button>
            </div>
            {/* סינון */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <input
                    value={filterArea}
                    onChange={e => setFilterArea(e.target.value)}
                    placeholder="סינון לפי שכונה..."
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', width: '200px' }} />
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <option value="">כל הסטטוסים</option>
                    <option value="pending">ממתין</option>
                    <option value="distributed">חולק</option>
                    <option value="not_delivered">לא נמסר</option>
                </select>
            </div>

            {loading ? <p>טוען...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#1a5c38', color: 'white' }}>
                            <th style={{ padding: '10px', textAlign: 'right' }}>שכונה</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>רחוב</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>בית</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>דירה</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>כתובת מלאה</th>
                        </tr>
                    </thead>
                    <tbody>
                        {addresses
                            .filter(a => filterArea ? a.addressId?.areaName?.includes(filterArea) : true)
                            .filter(a => filterStatus ? a.status === filterStatus : true)
                            .map((addr, i) => (
                                <tr key={addr._id} style={{ background: i % 2 === 0 ? '#fff' : '#f0f8f4', borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '10px' }}>{addr.addressId?.areaName}</td>
                                    <td style={{ padding: '10px' }}>{addr.addressId?.propertyAddress}</td>
                                    <td style={{ padding: '10px' }}>{addr.addressId?.houseNumber}</td>
                                    <td style={{ padding: '10px' }}>{addr.addressId?.apartmentNumber}</td>
                                    <td style={{ padding: '10px' }}>{addr.addressId?.fullAddress}</td>
                                    <td style={{ padding: '10px', color: addr.status === 'distributed' ? 'green' : addr.status === 'not_delivered' ? 'red' : 'gray' }}>
                                        {addr.status === 'distributed' ? '✅ חולק' : addr.status === 'not_delivered' ? '❌ לא נמסר' : '⏳ ממתין'}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            )}
        </div>
    );

};

export default AddressList;