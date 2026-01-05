import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import destinationsRouter from './routes/destinations.js';
import shipmentsRouter from './routes/shipments.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/destinations', destinationsRouter);
app.use('/api/shipments', shipmentsRouter);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Solship API Server',
        version: '1.0.0',
        endpoints: {
            destinations: '/api/destinations',
            shipments: '/api/shipments',
            health: '/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Start server
async function startServer() {
    try {
        // Test database connection
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('⚠ Warning: Database not connected. Please check your configuration.');
            console.error('⚠ Server will start but API calls will fail.');
        }

        app.listen(PORT, () => {
            console.log('');
            console.log('═══════════════════════════════════════════');
            console.log('  🚀 Solship API Server');
            console.log('═══════════════════════════════════════════');
            console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`  Port: ${PORT}`);
            console.log(`  URL: http://localhost:${PORT}`);
            console.log(`  API: http://localhost:${PORT}/api`);
            console.log('═══════════════════════════════════════════');
            console.log('');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
