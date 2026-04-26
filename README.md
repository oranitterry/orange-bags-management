# 🟠 מערכת ניהול חלוקת שקיות כתומות
### עיריית ערד — יחידה סביבתית

מערכת Full Stack לניהול פעולות חלוקת שקיות כתומות לאיסוף פסולת אורגנית.
המערכת מנהלת 2,916 כתובות מגורים ב-12 שכונות ערד.

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + Recharts
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt + RBAC

## תכונות עיקריות
- ניהול מחזורי חלוקה (פתיחה/סגירה/ארכיון)
- דשבורד עם גרפים וסטטיסטיקות בזמן אמת
- מערכת הרשאות 3 רמות (superadmin / admin / user)
- ייבוא 2,916 כתובות מ-Excel
- הקצאת כתובות למתנדבים

## הרצה מקומית
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## משתמש ברירת מחדל
- אימייל: admin@arad.gov.il
- סיסמה: admin123
