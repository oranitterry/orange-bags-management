import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import DeliveryRecord from '../models/DeliveryRecord';
import { Response } from 'express';
import User from '../models/User';
import Address from '../models/Address';

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
      const userData = await User.findById(req.user.id);
      const areas = userData?.assignedAreas || [];
      const addresses = await Address.find({ areaName: { $in: areas } });
      const addressIds = addresses.map(a => a._id);
      filter.addressId = { $in: addressIds };
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

    const records = await DeliveryRecord.find({ 
      roundId: require('mongoose').Types.ObjectId.createFromHexString(roundId) 
    })
      .populate('addressId', 'areaName');
    
      console.log('Total records found:', records.length);
      console.log('First record addressId:', JSON.stringify(records[0]?.addressId));

      const areaRecords = records.filter(r => {
        const addr = r.addressId as unknown as { areaName: string };
        const dbArea = addr?.areaName?.trim();
        const reqArea = Buffer.from(areaName, 'latin1').toString('utf8').trim();
        return dbArea === reqArea || dbArea === areaName.trim();
      });
    console.log('areaRecords length:', areaRecords.length);
    console.log('Looking for areaName:', areaName);
    console.log('typeof areaName:', typeof areaName); 

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
