import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MyList: React.FC = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [openStreet, setOpenStreet] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // שלב 1 - מקבל את המחזורים
        const roundsRes = await api.get('/rounds');
        const activeRound = roundsRes.data.find(
          (r: any) => r.status === 'active'
        );
        if (!activeRound) {
          setError('לא נמצא מחזור חלוקה פעיל כרגע');
          setLoading(false);
          return;
        };
  
        // שלב 2 - מקבל את הכתובות של המחזור הפעיל
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

  const filtered = deliveries.filter(d => 
    d.addressId?.fullAddress?.includes(searchText)
  );
  const grouped = Object.groupBy(filtered, (d: any) => d.addressId?.propertyAddress);

  return (
    <div style={{ direction: 'rtl', padding: '20px' }}>
      {/* 1. שימוש ב-user מעלים את האזהרה הראשונה */}
      <h1>שלום {user?.name}</h1>
      <h3>הרשימה שלי</h3>

      {/* 2. שימוש ב-searchText ו-setSearchText מעלים את אזהרות החיפוש */}
      <input 
        type="text" 
        placeholder="חפש/י רחוב או מספר בית..." 
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: '20px', padding: '8px', width: '100%' }}
      />

      {/* 3. שימוש ב-error מציג הודעה אם משהו השתבש */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>טוען נתונים מהשטח...</p>
      ) : (
        <div className="delivery-list">
          {/* 4. שימוש ב-deliveries מעלים את האזהרה האחרונה */}
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
    </div>
  );
};

export default MyList;

  
  
  
  