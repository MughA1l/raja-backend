import express from 'express';
import * as chapterController from '../controllers/chapter.controller.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import uploadChapter from '../middleware/multerLocal.js';

const router = express.Router();

// Public route - no auth required (must be before auth middleware)
router.get('/public/:shareToken', chapterController.getSharedChapter);

// using my auth middleware to protect backend!
router.use(auth);

const multiUpload = uploadChapter.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

router.post('/create', multiUpload, chapterController.createChapter);

router.get('/getAllChapters', chapterController.getUserChapters);

router.get(
  '/getAllChaptersByBook/:id',
  chapterController.getAllChaptersByBook
);

router.get('/getSingleChapter/:id', chapterController.getChapterById);

router.put('/updateChapter/:id', upload.single('image'), chapterController.updateChapter);

router.delete('/deleteChapter/:id', chapterController.deleteChapter);

// Share chapter routes (protected)
router.post('/share/:id', chapterController.shareChapter);
router.delete('/share/:id', chapterController.unshareChapter);
router.get('/share/:id', chapterController.getShareInfo);

export default router;
