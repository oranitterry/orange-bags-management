import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone?: string;
  email: string;
  passwordHash: string;
  role: 'superadmin' | 'admin' | 'user';
  assignedAreas: string[];
  isActive: boolean;
  lastLogin?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin', 'user'], default: 'user' },
  assignedAreas: [{ type: String }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
