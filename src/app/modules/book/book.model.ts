import { Schema, model } from 'mongoose';
import { BookModel, IBook } from './book.interface';

export const BookSchema = new Schema<IBook, BookModel>(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },

    publicationDate: {
      type: String,

      required: true,
    },
    reviews: {
      type: [String],

      required: true,
    },
    description: {
      type: String,
    },
    imageLink: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Book = model<IBook, BookModel>('Cow', BookSchema);
