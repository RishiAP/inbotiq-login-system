import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type Role = 'user' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  banned?: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  banned: { type: Boolean, default: false },
}, { timestamps: true });

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
