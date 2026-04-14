import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'נדרש אימייל וסיסמה' });
      return;
    }
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      res.status(401).json({ error: 'פרטים שגויים' });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'פרטים שגויים' });
      return;
    }
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

export const createInitialAdmin = async (): Promise<void> => {
  const exists = await User.findOne({ role: 'superadmin' });
  if (!exists) {
    const hash = await bcrypt.hash('admin123', 12);
    await User.create({
      name: 'Super Admin',
      email: 'admin@arad.gov.il',
      passwordHash: hash,
      role: 'superadmin',
      isActive: true,
    });
    console.log('✅ נוצר Super Admin: admin@arad.gov.il / admin123');
  }
};
