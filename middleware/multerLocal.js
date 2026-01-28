// middleware/multerLocal.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads/chapter-images exists
const uploadPath = path.join(
  process.cwd(),
  'public/uploads/chapters'
);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // unique filename
  },
});

const uploadChapter = multer({ storage });

export default uploadChapter;
