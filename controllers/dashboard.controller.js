import * as dashboardService from '../services/dashboard.services.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const dashboardData = await dashboardService.getDashboardData(userId);

    res.status(200).json({
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};
