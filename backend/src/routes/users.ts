import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { Response } from 'express';

const router = Router();

// GET /api/users
router.get('/', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ name: 1 });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// POST /api/users
router.post('/', authenticate, requireRole('admin', 'superadmin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone, assignedAreas } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'נדרש שם, אימייל וסיסמה' });
      return;
    }
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400).json({ error: 'אימייל כבר קיים' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role: role || 'user', phone, assignedAreas: assignedAreas || [] });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// PATCH /api/users/:id
router.patch('/:id', authenticate, requireRole('superadmin'), async (req, res) => {
  try {
    const { name, role, phone, assignedAreas, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, phone, assignedAreas, isActive },
      { new: true }
    ).select('-passwordHash');
    if (!user) { res.status(404).json({ error: 'משתמש לא נמצא' }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

export default router;
