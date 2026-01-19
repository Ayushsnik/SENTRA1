import mongoose from 'mongoose';

const awarenessSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Policy', 'Safety Tips', 'Contact', 'Resource', 'Guide'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  icon: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Awareness = mongoose.model('Awareness', awarenessSchema);

export default Awareness;