import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import Round from '../models/Round';
import DeliveryRecord from '../models/DeliveryRecord';
import Address from '../models/Address';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

// GET /api/rounds - רשימת כל המחזורים
router.get('/', authenticate, requireRole('admin', 'superadmin', 'user'), async (req, res) => {
  try {
    const rounds = await Round.find().sort({ createdAt: -1 });
    res.json(rounds);
  } catch {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// POST /api/rounds - יצירת מחזור חדש
router.post('/', authenticate, requireRole('admin', 'superadmin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, year } = req.body;
    if (!name || !year) {
      res.status(400).json({ error: 'נדרש שם ושנה' });
      return;
    }

    const round = await Round.create({
      name,
      year,
      status: 'draft',
    });

    // יצירת רשומות חלוקה לכל הכתובות
    const addresses = await Address.find();
    const records = addresses.map(addr => ({
      roundId: round._id,
      addressId: addr._id,
      status: 'pending',
    }));
    await DeliveryRecord.insertMany(records);

    res.status(201).json({ round, recordsCreated: records.length });
  } catch {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// PATCH /api/rounds/:id/open - פתיחת מחזור
router.patch('/:id/open', authenticate, requireRole('admin', 'superadmin'), async (req: AuthRequest, res: Response) => {
  try {
    const round = await Round.findByIdAndUpdate(
      req.params.id,
      { status: 'active', openedAt: new Date(), openedBy: req.user?.id },
      { new: true }
    );
    if (!round) { res.status(404).json({ error: 'מחזור לא נמצא' }); return; }
    res.json(round);
  } catch {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// PATCH /api/rounds/:id/close - סגירת מחזור
router.patch('/:id/close', authenticate, requireRole('admin', 'superadmin'), async (req: AuthRequest, res: Response) => {
  try {
    const round = await Round.findByIdAndUpdate(
      req.params.id,
      { status: 'closed', closedAt: new Date(), closedBy: req.user?.id },
      { new: true }
    );
    if (!round) { res.status(404).json({ error: 'מחזור לא נמצא' }); return; }
    res.json(round);
  } catch {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// GET /api/rounds/:id/stats - סטטיסטיקות מחזור
router.get('/:id/stats', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const stats = await DeliveryRecord.aggregate([
      { $match: { roundId: require('mongoose').Types.ObjectId.createFromHexString(req.params.id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const result: Record<string, number> = { pending: 0, distributed: 0, not_delivered: 0, return_visit: 0 };
    stats.forEach(s => { result[s._id] = s.count; });
    result.total = Object.values(result).reduce((a, b) => a + b, 0);

    // סטטיסטיקות לפי שכונה
    const byArea = await DeliveryRecord.aggregate([
      { $match: { roundId: require('mongoose').Types.ObjectId.createFromHexString(req.params.id) } },
      { $lookup: { from: 'addresses', localField: 'addressId', foreignField: '_id', as: 'address' } },
      { $unwind: '$address' },
      { $group: { _id: { area: '$address.areaName', status: '$status' }, count: { $sum: 1 } } },
      { $sort: { '_id.area': 1 } }
    ]);

    res.json({ summary: result, byArea });
  } catch (err) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

export default router;
