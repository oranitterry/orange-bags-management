import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';
import { createInitialAdmin } from './controllers/authController';

dotenv.config();

const PORT = process.env.PORT || 5000;

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