import * as dashboardRepository from '../repositories/dashboard.repository.js';

export const getDashboardData = async (userId) => {
  // Fetch all dashboard data in parallel
  const [statistics, recentBooks, recentChapters] = await Promise.all([
    dashboardRepository.aggregateUserStatistics(userId),
    dashboardRepository.getRecentBooks(userId, 6),
    dashboardRepository.getRecentChapters(userId, 6),
  ]);

  // Calculate overall progress
  const totalItems =
    statistics.books.total +
    statistics.chapters.total +
    statistics.images.total;
  const completedItems =
    statistics.books.completed +
    statistics.chapters.completed +
    statistics.images.completed;
  const overallProgress =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    statistics: {
      ...statistics,
      overall: {
        total: totalItems,
        completed: completedItems,
        progress: overallProgress,
      },
    },
    recentBooks,
    recentChapters,
  };
};
