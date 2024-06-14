/* eslint-disable func-names */
/* eslint-disable consistent-return */
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export const TradeRequestSchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['pending', 'accepted', 'rejected'],
    },
    requestedDate: { type: Date, required: true, default: Date.now },
    senderID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderWants: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    senderGives: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    receiverID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    uploadedBooks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        uploadDate: { type: Date, default: Date.now },
      },
    ],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    sentTradeRequests: [TradeRequestSchema],
    receivedTradeRequests: [TradeRequestSchema],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

// Hash the password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
