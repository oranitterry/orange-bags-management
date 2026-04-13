import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  areaName: string;
  propertyAddress: string;
  houseNumber: number;
  apartmentNumber: number;
  fullAddress: string;
  propertyNumber: number;
}

const AddressSchema = new Schema<IAddress>({
  areaName: { type: String, required: true },
  propertyAddress: { type: String, required: true },
  houseNumber: { type: Number, required: true },
  apartmentNumber: { type: Number, required: true },
  fullAddress: { type: String, required: true, unique: true },
  propertyNumber: { type: Number },
}, { timestamps: true });

export default mongoose.model<IAddress>('Address', AddressSchema);
