import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import roundRoutes from './routes/rounds';
import deliveryRoutes from './routes/deliveries';
import userRoutes from './routes/users';
import { createInitialAdmin } from './controllers/authController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'שרת פועל!' });
});
app.use('/api/auth', authRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/users', userRoutes);

// חיבור ל-MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/orange_bags')
  .then(async () => {
    console.log('✅ מחובר ל-MongoDB');
    await createInitialAdmin();
    app.listen(PORT, () => {
      console.log(`✅ שרת פועל על פורט ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ שגיאה בחיבור ל-MongoDB:', err);
  });
