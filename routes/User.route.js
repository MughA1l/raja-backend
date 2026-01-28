import express from 'express';
import * as userController from '../controllers/user.controller.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

const codeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
});
router.post('/send-code', codeLimiter, userController.getCode);

router.post('/verify-code', userController.verifyCode);

router.patch('/reset-password', userController.resetPassword);

export default router;
