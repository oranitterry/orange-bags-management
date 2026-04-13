import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryRecord extends Document {
  roundId: mongoose.Types.ObjectId;
  addressId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  status: 'pending' | 'distributed' | 'not_delivered' | 'return_visit';
  distributedAt?: Date;
  distributedBy?: mongoose.Types.ObjectId;
  deliveryMethod?: string;
  notes?: string;
}

const DeliveryRecordSchema = new Schema<IDeliveryRecord>({
  roundId: { type: Schema.Types.ObjectId, ref: 'Round', required: true },
  addressId: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'distributed', 'not_delivered', 'return_visit'], default: 'pending' },
  distributedAt: { type: Date },
  distributedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deliveryMethod: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model<IDeliveryRecord>('DeliveryRecord', DeliveryRecordSchema);
