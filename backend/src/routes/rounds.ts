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

router.get('/:id/export', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    
    const records = await DeliveryRecord.find({
      roundId: require('mongoose').Types.ObjectId.createFromHexString(req.params.id)
    })
      .populate('addressId', 'areaName propertyAddress houseNumber apartmentNumber')
      .populate('distributedBy', 'name');

    const round = await require('../models/Round').default.findById(req.params.id);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('חלוקה');

    worksheet.columns = [
      { header: 'שכונה', key: 'area', width: 15 },
      { header: 'רחוב', key: 'street', width: 20 },
      { header: 'בית', key: 'house', width: 8 },
      { header: 'דירה', key: 'apt', width: 8 },
      { header: 'סטטוס', key: 'status', width: 15 },
      { header: 'תאריך חלוקה', key: 'date', width: 15 },
      { header: 'מי חילק', key: 'who', width: 20 },
      { header: 'אופן מסירה', key: 'method', width: 20 },
      { header: 'הערות', key: 'notes', width: 30 },
    ];

    // עיצוב כותרת
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FF1a5c38' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    const statusMap: Record<string, string> = {
      pending: 'ממתין',
      distributed: 'חולק',
      not_delivered: 'לא נמסר',
      return_visit: 'יחזור',
    };

    records.forEach(r => {
      const addr = r.addressId as any;
      worksheet.addRow({
        area: addr?.areaName || '',
        street: addr?.propertyAddress || '',
        house: addr?.houseNumber || '',
        apt: addr?.apartmentNumber || '',
        status: statusMap[r.status] || r.status,
        date: r.distributedAt ? new Date(r.distributedAt).toLocaleDateString('he-IL') : '',
        who: (r.distributedBy as any)?.name || '',
        method: r.deliveryMethod || '',
        notes: r.notes || '',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="round-export.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

export default router;
