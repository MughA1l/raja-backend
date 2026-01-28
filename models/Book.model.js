import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import Chapter from './Chapter.model.js';

const bookSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    chapters: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Chapter',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// one user cannot have the same named book again
bookSchema.index({ userId: 1, name: 1 }, { unique: true });

// delete all the chapters that are in that book
bookSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    try {
      const bookId = this._id;
      const chapters = await Chapter.find({ bookId });

      for (const chapter of chapters) {
        await chapter.deleteOne(); // This will trigger Chapter's pre hook
      }

      next();
    } catch (err) {
      next(err);
    }
  }
);

const Book = mongoose.model('Book', bookSchema);

export default Book;
