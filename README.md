🟠 מערכת ניהול חלוקת שקיות כתומות
### עיריית ערד — יחידה סביבתית

מערכת Full Stack לניהול פעולות חלוקת שקיות כתומות לאיסוף פסולת אורגנית.
המערכת מנהלת **2,916 כתובות מגורים ב-12 שכונות ערד**.

---

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + Recharts
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB 8 + Mongoose
- **Auth:** JWT + bcrypt + RBAC

---

## תכונות עיקריות
- ניהול מחזורי חלוקה — פתיחה, סגירה, ארכיון
- דשבורד עם גרפים וסטטיסטיקות בזמן אמת
- מערכת הרשאות 3 רמות (superadmin / admin / user)
- ממשק מתנדב Mobile-First עם דיווח חלוקה
- ניהול משתמשים מלא (הוספה, עריכה, נעילה)
- רשימת כתובות עם סינון לפי שכונה וסטטוס
- ייבוא כתובות מ-Excel
- ייצוא דוחות ל-Excel
- הוספת כתובת ידנית
- Sidebar ניווט מהיר

---

## מבנה הפרויקט
orange-bags-management/
├── backend/          # Node.js + Express + TypeScript
│   └── src/
│       ├── models/   # MongoDB Schemas
│       ├── routes/   # API Endpoints
│       ├── controllers/
│       └── middleware/
├── frontend/         # React + TypeScript + Vite
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/
│       └── api/
└── seed-data/        # ייבוא כתובות מקוריות

---

## הרצה מקומית

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (טרמינל נפרד)
cd frontend
npm install
npm run dev
```

---

## משתמשים לדמו

| משתמש | אימייל | סיסמה | הרשאה |
|--------|--------|--------|--------|
| Super Admin | admin@arad.gov.il | admin123 | superadmin |
| מנהל יחידה | admin2@arad.gov.il | admin123 | admin |
| מתנדבת | volunteer@test.com | test123 | user |

---

## API Endpoints עיקריים
- `POST /api/auth/login`
- `GET/POST /api/rounds`
- `GET /api/rounds/:id/stats`
- `GET /api/rounds/:id/export`
- `GET/PATCH /api/deliveries`
- `POST /api/deliveries/assign`
- `GET/POST/PATCH /api/users`
- `GET/POST /api/addresses`
- `POST /api/addresses/import`