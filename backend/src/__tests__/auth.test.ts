import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/User';
import bcrypt from 'bcryptjs';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/orange_bags_test');

  const hash = await bcrypt.hash('test123', 12);
  
  await User.create({
    name: 'Test Admin',
    email: 'test@test.com',
    passwordHash: hash,
    role: 'superadmin',
    isActive: true,
  });

  await User.create({
    name: 'Disabled User',
    email: 'test1@test.com',
    passwordHash: hash,
    role: 'user',
    isActive: false,
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('POST /api/auth/login', () => {

  it('כניסה עם פרטים נכונים מחזירה token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('כניסה עם סיסמה שגויה מחזירה 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test1234' });

    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
  });

  it('כניסה עם יוזר מושבת מחזירה 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test1@test.com', password: 'test123' });

    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
  });

});