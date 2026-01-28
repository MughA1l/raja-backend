import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT || 3000;
import errorHandler from './middleware/errorHandler.js';
import connectDB from './config (db connect)/connection.db.js';
import userRoutes from './routes/User.route.js';
import bookRoutes from './routes/Book.route.js';
import chapterRoutes from './routes/Chapter.route.js';
import imageRoutes from './routes/Image.route.js';
import settingsRoutes from './routes/Settings.route.js';
import dashboardRoutes from './routes/Dashboard.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { cloudinaryConnect } from './config (db connect)/cloudinary.config.js';
import path from 'path';
import { createSocketServer } from './config (db connect)/socket.io.js';
import { startWorker } from './services/bull-MQ/worker.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerDocument = YAML.load('./docs/swagger.yaml');
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(
  '/public',
  express.static(path.join(process.cwd(), 'public'))
);

// connect to mongodb
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // cloudinary configurations
    await cloudinaryConnect();

    // Routes
    app.use('/api/users', userRoutes);
    app.use('/api/books', bookRoutes);
    app.use('/api/chapters', chapterRoutes);
    app.use('/api/images', imageRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/dashboard', dashboardRoutes);

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.status(200).json({ 
        status: 'ok', 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    app.get('/', (req, res) => {
      res.send('AI-Study-Sync Backend API - Server is running');
    });

    // custom errors handling
    app.use(errorHandler);

    // connect to the socket.io server
    const server = createSocketServer(app);

    server.listen(port, () => {
      console.log(
        `Server running with Express + Socket.IO on port ${port}`
      );
    });

    // start bullMQ worker
    startWorker();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
