import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import Address from '../models/Address';
import Round from '../models/Round';
import DeliveryRecord from '../models/DeliveryRecord';

const router = Router();

router.post('/import', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
    try {
        const { addresses } = req.body;
        if (!addresses?.length) {
            res.status(400).json({ error: 'לא נשלחו כתובות' });
            return;
        }

        let added = 0;
        let skipped = 0;

        for (const row of addresses) {
            try {
                const areaName = row['AreaName'] || row['שכונה'] || '';
                const propertyAddress = row['PropertyAddress'] || row['רחוב'] || '';
                const houseNumber = Number(row['HouseNumber'] || row['מספר בית'] || 0);
                const apartmentNumber = Number(row['ApartmentNumber'] || row['דירה'] || 0);
                const fullAddress = `${areaName} ${propertyAddress} ${houseNumber} ${apartmentNumber || ''}`.trim();

                if (!areaName || !propertyAddress || !houseNumber) {
                    skipped++;
                    continue;
                }

                await Address.create({ areaName, propertyAddress, houseNumber, apartmentNumber, fullAddress, propertyNumber: 0 });
                added++;
            } catch (err: any) {
                if (err.code === 11000) skipped++; // כתובת כפולה
                else throw err;
            }
        }

        res.json({ added, skipped, total: addresses.length });
    } catch {
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});

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

router.get('/', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
    try {
        const activeRound = await Round.findOne({ status: 'active' });
        if (!activeRound) {
            res.json([]);
            return;
        }

        const records = await DeliveryRecord.find({ roundId: activeRound._id })
            .populate('addressId', 'areaName propertyAddress houseNumber apartmentNumber fullAddress')
            .populate('assignedTo', 'name')
            .sort({ 'addressId.areaName': 1 });

        res.json(records);
    } catch {
        res.status(500).json({ error: 'שגיאת שרת' });
    }

});

export default router;