import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MyList: React.FC = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');



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
            deliveries
              .filter(d => d.addressId?.propertyAddress?.includes(searchText))
              .map((item) => (
                <div key={item._id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                  <p><strong>כתובת:</strong> {item.addressId?.propertyAddress} {item.addressId?.houseNumber}</p>
                  <p>סטטוס: {item.status}</p>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyList;

  
  
  
  