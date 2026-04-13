import mongoose, { Schema, Document } from 'mongoose';

export interface IRound extends Document {
  name: string;
  year: number;
  status: 'draft' | 'active' | 'closed';
  openedAt?: Date;
  openedBy?: mongoose.Types.ObjectId;
  closedAt?: Date;
  closedBy?: mongoose.Types.ObjectId;
}

const RoundSchema = new Schema<IRound>({
  name: { type: String, required: true },
  year: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
  openedAt: { type: Date },
  openedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  closedAt: { type: Date },
  closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<IRound>('Round', RoundSchema);
