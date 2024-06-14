import mongoose, { Schema } from 'mongoose';

export const BookSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, required: false },
    readingTime: { type: String, required: false },
    condition: { type: String, required: false },
    datePublished: { type: Date, required: true },
    ISBN: { type: String, required: true },
    coverImage: { type: String, required: false },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tradeStatus: {
      type: String,
      required: true,
      enum: ['available', 'traded', 'in progress'],
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

const BookModel = mongoose.model('Book', BookSchema);

export default BookModel;
