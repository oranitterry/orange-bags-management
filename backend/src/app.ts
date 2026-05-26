import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import roundRoutes from './routes/rounds';
import deliveryRoutes from './routes/deliveries';
import userRoutes from './routes/users';
import addressesRoutes from './routes/addresses';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'שרת פועל!' });
});
app.use('/api/auth', authRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressesRoutes);

export default app;