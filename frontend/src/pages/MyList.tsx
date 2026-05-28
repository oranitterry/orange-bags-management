import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MyList: React.FC = () => {
  const { user, logout } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [openStreet, setOpenStreet] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'distributed' | 'not_delivered'>('pending');


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const roundsRes = await api.get('/rounds');
        const activeRound = roundsRes.data.find((r: any) => r.status === 'active');
        if (!activeRound) {
          setError('לא נמצא מחזור חלוקה פעיל כרגע');
          setLoading(false);
          return;
        }
        const deliveriesRes = await api.get('/deliveries', {
          params: { round: activeRound._id }
        });
        setDeliveries(deliveriesRes.data);
      } catch (err) {
        setError('שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery) return;
    try {
      await api.patch(`/deliveries/${selectedDelivery._id}`, {
        status: selectedStatus,
        notes: notes
      });
      setDeliveries(prev => prev.map(d =>
        d._id === selectedDelivery._id ? { ...d, status: selectedStatus } : d
      ));
      setShowModal(false);
      setSelectedDelivery(null);
      setNotes('');
    } catch (err) {
      alert('שגיאה בשמירת הדיווח');
    }
  };

  const filtered = deliveries
    .filter(d => d.status === activeTab)
    .filter(d => d.addressId?.fullAddress?.includes(searchText));

  const grouped = Object.groupBy(filtered, (d: any) => d.addressId?.propertyAddress);
  const DELIVERED_METHODS = [
    'ישירות לתושב (כולל הסבר)',
    'הושאר ליד הדלת',
  ];

  const NOT_DELIVERED_METHODS = [
    'סרב לקבל',
    'לא נמסר - מבנה ציבור',
    'אחר...',
  ];

  return (
    <div style={{ direction: 'rtl', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>שלום {user?.name}</h1>
        <button onClick={logout} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>
          יציאה
        </button>
      </div>
      <h3>הרשימה שלי</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'pending', label: '⏳ ממתין' },
          { key: 'distributed', label: '✅ חולק' },
          { key: 'not_delivered', label: '❌ לא נמסר' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: 'bold',
              background: activeTab === tab.key ? '#1a5c38' : '#eee',
              color: activeTab === tab.key ? 'white' : '#333',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="חפש/י רחוב או מספר בית..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: '20px', padding: '8px', width: '100%' }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>טוען נתונים מהשטח...</p>
      ) : (
        <div>
          {deliveries.length === 0 ? (
            <p>לא נמצאו כתובות לביצוע.</p>
          ) : (
            Object.entries(grouped).map(([street, items]: [string, any]) => {
              const isOpen = openStreet === street;
              return (
                <div key={street} style={{ marginBottom: '8px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                  <div onClick={() => setOpenStreet(isOpen ? null : street)}
                    style={{ cursor: 'pointer', padding: '12px', background: '#f0f8f4', display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{street}</strong>
                    <span>{isOpen ? '▲' : '▼'} ({items?.length} כתובות)</span>
                  </div>
                  {isOpen && (
                    <div>
                      {items?.map((item: any) => (
                        <div key={item._id} style={{ borderBottom: '1px solid #eee', padding: '10px 12px' }}>
                          <p><strong>{item.addressId?.houseNumber}</strong> — דירה {item.addressId?.apartmentNumber}</p>
                          <p style={{ color: item.status === 'distributed' ? 'green' : item.status === 'not_delivered' ? 'red' : 'gray' }}>
                            {item.status === 'distributed' ? '✅ חולק' : item.status === 'not_delivered' ? '❌ לא נמסר' : '⏳ ממתין'}
                          </p>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button
                              onClick={() => { setSelectedDelivery(item); setSelectedStatus('distributed'); setShowModal(true); }}
                              style={{ background: '#1a5c38', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
                              ✅ חולק
                            </button>
                            <button
                              onClick={() => { setSelectedDelivery(item); setSelectedStatus('not_delivered'); setShowModal(true); }}
                              style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
                              ❌ לא נמסר
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {showModal && selectedDelivery && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }} onClick={() => { setShowModal(false); setSelectedDelivery(null); }}>
          <div style={{
            backgroundColor: '#fff', padding: '20px', borderRadius: '12px',
            width: '90%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            boxSizing: 'border-box'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>דיווח חלוקה</h3>
              <button onClick={() => { setShowModal(false); setSelectedDelivery(null); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ backgroundColor: '#f4fbf7', padding: '12px', borderRadius: '8px', margin: '15px 0', border: '1px solid #e0f2f1' }}>
              <p style={{ margin: 0 }}>📍 <strong>{selectedDelivery.addressId?.propertyAddress}, בית {selectedDelivery.addressId?.houseNumber}</strong></p>
              <p style={{ margin: '5px 0 0 0' }}>🚪 דירה: <strong>{selectedDelivery.addressId?.apartmentNumber}</strong></p>
            </div>
            <form onSubmit={handleSaveReport} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '8px' }}>סטטוס:</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button type="button" onClick={() => setSelectedStatus('distributed')}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer', fontWeight: 'bold', backgroundColor: selectedStatus === 'distributed' ? '#1a5c38' : '#fff', color: selectedStatus === 'distributed' ? '#fff' : '#333' }}>
                  ✅ חולק
                </button>
                <button type="button" onClick={() => setSelectedStatus('not_delivered')}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer', fontWeight: 'bold', backgroundColor: selectedStatus === 'not_delivered' ? '#ef4444' : '#fff', color: selectedStatus === 'not_delivered' ? '#fff' : '#333' }}>
                  ❌ לא נמסר
                </button>
              </div>
              <label style={{ fontWeight: 'bold', marginBottom: '8px' }}>אופן מסירה:</label>
              <select
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '15px' }}>
                <option value="">-- בחרי --</option>
                {(selectedStatus === 'distributed' ? DELIVERED_METHODS : NOT_DELIVERED_METHODS).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <label style={{ fontWeight: 'bold', marginBottom: '8px' }}>הערות:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="לדוגמה: הושאר בארון חשמל, שער נעול..."
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', minHeight: '60px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '15px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button type="button" onClick={() => { setShowModal(false); setSelectedDelivery(null); }}
                  style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>ביטול</button>
                <button type="submit"
                  style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#1a5c38', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>שמור דיווח</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyList;