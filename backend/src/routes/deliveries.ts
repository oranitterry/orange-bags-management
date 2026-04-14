import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import DeliveryRecord from '../models/DeliveryRecord';
import { Response } from 'express';

const router = Router();

// GET /api/deliveries - רשימת רשומות (מסונן)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { round, status, assignedTo } = req.query;
    const filter: Record<string, unknown> = {};

    if (round) filter.roundId = round;
    if (status) filter.status = status;

    // משתמש רגיל רואה רק את הכתובות שלו
    if (req.user?.role === 'user') {
      filter.assignedTo = req.user.id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const records = await DeliveryRecord.find(filter)
      .populate('addressId', 'areaName propertyAddress houseNumber apartmentNumber fullAddress')
      .populate('assignedTo', 'name')
      .sort({ 'addressId.areaName': 1 });

    res.json(records);
  } catch {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// PATCH /api/deliveries/:id - עדכון סטטוס חלוקה
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, deliveryMethod, notes } = req.body;

    const record = await DeliveryRecord.findById(req.params.id);
    if (!record) {
      res.status(404).json({ error: 'רשומה לא נמצאה' });
      return;
    }

    // משתמש רגיל יכול לעדכן רק כתובות שלו
    if (req.user?.role === 'user' && record.assignedTo?.toString() !== req.user.id) {
      res.status(403).json({ error: 'אין הרשאה' });
      return;
    }

    const validStatuses = ['pending', 'distributed', 'not_delivered', 'return_visit'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: 'סטטוס לא תקין' });
      return;
    }

    record.status = status || record.status;
    if (status === 'distributed') {
      record.distributedAt = new Date();
      record.distributedBy = req.user?.id as unknown as typeof record.distributedBy;
    }
    if (deliveryMethod) record.deliveryMethod = deliveryMethod;
    if (notes !== undefined) record.notes = notes;

    await record.save();
    res.json(record);
  } catch {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// POST /api/deliveries/assign - הקצאת כתובות למתנדבים
router.post('/assign', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { roundId, areaName, userIds } = req.body;
    if (!roundId || !areaName || !userIds?.length) {
      res.status(400).json({ error: 'נדרש roundId, areaName ו-userIds' });
      return;
    }

    const records = await DeliveryRecord.find({ roundId })
      .populate('addressId', 'areaName');

    const areaRecords = records.filter(
      r => (r.addressId as unknown as { areaName: string })?.areaName === areaName
    );

    // חלוקה שווה בין המתנדבים
    let userIndex = 0;
    for (const record of areaRecords) {
      record.assignedTo = userIds[userIndex % userIds.length];
      await record.save();
      userIndex++;
    }

    res.json({ assigned: areaRecords.length, toUsers: userIds.length });
  } catch {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

export default router;
