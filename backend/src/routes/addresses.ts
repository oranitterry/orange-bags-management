import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import Address from '../models/Address';
import Round from '../models/Round';
import DeliveryRecord from '../models/DeliveryRecord';

const router = Router();

router.post('/', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
    try {
      const { areaName, propertyAddress, houseNumber, apartmentNumber } = req.body;
      
      if (!areaName || !propertyAddress || !houseNumber) {
        res.status(400).json({ error: 'נדרש שכונה, רחוב ומספר בית' });
        return;
      }
  
      // יצירת כתובת חדשה
      const fullAddress = `${areaName} ${propertyAddress} ${houseNumber} ${apartmentNumber || ''}`.trim();
      const address = await Address.create({
        areaName, propertyAddress, houseNumber, apartmentNumber: apartmentNumber || 0,
        fullAddress, propertyNumber: 0
      });
  
      // מציאת מחזור פעיל
      const activeRound = await Round.findOne({ status: 'active' });
      if (activeRound) {
        await DeliveryRecord.create({
          roundId: activeRound._id,
          addressId: address._id,
          status: 'pending',
        });
      }
  
      res.status(201).json({ address, addedToRound: !!activeRound });
    } catch (err: any) {
      if (err.code === 11000) {
        res.status(400).json({ error: 'כתובת זו כבר קיימת במערכת' });
        return;
      }
      res.status(500).json({ error: 'שגיאת שרת' });
    }
  });
  
  export default router;