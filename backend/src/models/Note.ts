import mongoose, { Document, Schema } from 'mongoose';

// Note: timestamps: true adds `createdAt` and `updatedAt` automatically
export interface INote extends Document {
  user: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId; // who created the note (user or admin)
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const NoteSchema = new Schema<INote>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const Note = mongoose.model<INote>('Note', NoteSchema);
export default Note;
