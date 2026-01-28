import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(auth);

// Dashboard data route
router.get('/', dashboardController.getDashboardData);

export default router;
