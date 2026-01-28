import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [3, 'Password must be of 4 length'],
      select: false,
    },
    profileImage: {
      type: String,
      default: null,
    },
    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.method('addRefreshToken', async function (token) {
  this.refreshTokens.push({
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return this.save();
});

userSchema.method('removeRefreshToken', async function (token) {
  const initialLength = this.refreshTokens.length;

  this.refreshTokens = this.refreshTokens.filter(
    (t) => t.token !== token
  );

  if (this.refreshTokens.length === initialLength) {
    return false; // Or return false
  }

  await this.save();
  return true; // Explicit success feedback
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(err);
  }
});

userSchema.statics.updatePasswordByEmail = async function (
  email,
  newPassword
) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return this.findOneAndUpdate(
    { email }, // Find by email
    {
      $set: { password: hashedPassword },
    },
    { new: true }
  );
};

userSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
