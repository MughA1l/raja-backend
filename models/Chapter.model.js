import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import Image from './Image.model.js';

const chapterSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
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
    isMids: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      default: null,
      index: true,
    },
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Image',
      },
    ],
  },
  {
    timestamps: true,
  }
);

chapterSchema.index({ bookId: 1, name: 1 }, { unique: true });

chapterSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    try {
      const chapterId = this._id;
      await Image.deleteMany({ chapterId });
      next();
    } catch (err) {
      next(err);
    }
  }
);

const Chapter = mongoose.model('Chapter', chapterSchema);

export default Chapter;
