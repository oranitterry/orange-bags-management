import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import Address from './models/Address';

dotenv.config();

// נתוני הכתובות מיובאים מקובץ JSON
const dataPath = path.join(__dirname, '../../seed-data/addresses.json');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/orange_bags');
    console.log('✅ מחובר ל-MongoDB');

    const raw = fs.readFileSync(dataPath, 'utf-8');
    const addresses = JSON.parse(raw);
    console.log(`📂 נטענו ${addresses.length} כתובות מהקובץ`);

    await Address.deleteMany({});
    console.log('🗑️ נמחקו כתובות קיימות');

    const result = await Address.insertMany(addresses, { ordered: false });
    console.log(`✅ יובאו ${result.length} כתובות בהצלחה!`);

    // סטטיסטיקות לפי שכונה
    const stats = await Address.aggregate([
      { $group: { _id: '$areaName', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('\n📊 כתובות לפי שכונה:');
    stats.forEach(s => console.log(`  ${s._id}: ${s.count}`));

    await mongoose.disconnect();
    console.log('\n✅ הסתיים!');
  } catch (err) {
    console.error('❌ שגיאה:', err);
    process.exit(1);
  }
}

seed();
