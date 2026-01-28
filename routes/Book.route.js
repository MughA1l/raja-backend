import express from 'express';
import * as bookController from '../controllers/book.controller.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.use(auth); // Protect all routes below

router.post(
  '/create',
  upload.single('image'),
  bookController.createBook
);
router.get('/getAllBooks', bookController.getUserBooks);
router.get('/getSingleBook/:id', bookController.getBookById);
router.put(
  '/updateBook/:id',
  upload.single('image'),
  bookController.updateBook
);
router.delete('/deleteBook/:id', bookController.deleteBook);

export default router;
