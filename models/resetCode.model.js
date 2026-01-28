import mongoose from 'mongoose';

const codeSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
    unique: true,
  },
  code: {
    type: String,
    require: true,
    maxLength: 4,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now, expires: '5m' },
});

const Code = mongoose.model('Code', codeSchema);

export default Code;
