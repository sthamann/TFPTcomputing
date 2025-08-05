import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Configuration
const PORT = process.env.PORT || 8000;
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8001';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting - only in production
if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'local') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use('/api/', limiter);
}

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Topological Constants API',
      version: '1.0.0',
      description: 'API for calculating physics constants using Topological Fixed Point Framework'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// WebSocket handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  // Forward messages from Python service
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      // Forward to Python service WebSocket if needed
      console.log('Received message:', data);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

/**
 * @swagger
 * /api/constants:
 *   get:
 *     summary: Get list of all constants
 *     tags: [Constants]
 *     responses:
 *       200:
 *         description: List of constants with metadata
 */
app.get('/api/constants', async (req, res) => {
  try {
    // In Docker, constants are mounted at /app/constants
    const constantsDir = process.env.NODE_ENV === 'local' 
      ? join(__dirname, '../../constants/data')
      : process.env.NODE_ENV === 'development'
      ? '/app/constants/data'
      : join(__dirname, '../../constants/data');
    
    console.log(`Loading constants from: ${constantsDir}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Check if directory exists
    try {
      await fs.access(constantsDir);
    } catch (err) {
      console.error(`Constants directory not found: ${constantsDir}`);
      return res.status(500).json({ error: `Constants directory not found: ${constantsDir}` });
    }
    
    const files = await fs.readdir(constantsDir);
    const constants = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await fs.readFile(join(constantsDir, file), 'utf-8');
          const constant = JSON.parse(content);
          constants.push({
            id: constant.id,
            symbol: constant.symbol,
            name: constant.name,
            category: constant.category,
            unit: constant.unit
          });
        } catch (fileError) {
          console.error(`Error loading file ${file}:`, fileError);
          // Continue with other files
        }
      }
    }
    
    res.json(constants);
  } catch (error) {
    console.error('Error loading constants:', error);
    res.status(500).json({ error: 'Failed to load constants', details: error.message });
  }
});

/**
 * @swagger
 * /api/constants/{id}:
 *   get:
 *     summary: Get detailed information about a specific constant
 *     tags: [Constants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The constant ID
 *     responses:
 *       200:
 *         description: Constant details including formula and sources
 *       404:
 *         description: Constant not found
 */
app.get('/api/constants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // In Docker, constants are mounted at /app/constants
    const constantsBase = process.env.NODE_ENV === 'local' 
      ? join(__dirname, '../../constants/data')
      : process.env.NODE_ENV === 'development'
      ? '/app/constants/data'
      : join(__dirname, '../../constants/data');
    const constantPath = join(constantsBase, `${id}.json`);
    
    try {
      const content = await fs.readFile(constantPath, 'utf-8');
      const constant = JSON.parse(content);
      
      // First check for JSON result file
      const resultsBase = process.env.NODE_ENV === 'local' 
        ? join(__dirname, '../../constants/results/json')
        : process.env.NODE_ENV === 'development'
        ? '/app/constants/results/json'
        : join(__dirname, '../../constants/results/json');
      const resultPath = join(resultsBase, `${id}_result.json`);
      
      try {
        const resultContent = await fs.readFile(resultPath, 'utf-8');
        const result = JSON.parse(resultContent);
        constant.lastCalculation = {
          ...result,
          status: result.accuracy_met ? 'completed' : 'error',
          timestamp: new Date().toISOString()
        };
      } catch (fileError) {
        // No JSON result file, check Python service
        try {
          const response = await axios.get(`${PYTHON_SERVICE_URL}/calculate/${id}`, {
            params: { from_cache: true }
          });
          constant.lastCalculation = response.data;
        } catch (calcError) {
          // No cached result either
          constant.lastCalculation = null;
        }
      }
      
      res.json(constant);
    } catch (error) {
      res.status(404).json({ error: `Constant ${id} not found` });
    }
  } catch (error) {
    console.error('Error loading constant:', error);
    res.status(500).json({ error: 'Failed to load constant' });
  }
});

/**
 * @swagger
 * /api/constants/{id}/calculate:
 *   post:
 *     summary: Calculate a constant value
 *     tags: [Constants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The constant ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parameters:
 *                 type: object
 *                 description: Optional parameters for calculation
 *               forceRecalculate:
 *                 type: boolean
 *                 description: Force recalculation even if cached
 *     responses:
 *       200:
 *         description: Calculation started or result returned
 *       404:
 *         description: Constant not found
 */
app.post('/api/constants/:id/calculate', async (req, res) => {
  try {
    const { id } = req.params;
    const { parameters, forceRecalculate } = req.body;
    
    // Forward to Python service
    const response = await axios.post(`${PYTHON_SERVICE_URL}/calculate/${id}`, {
      constant_id: id,
      parameters: parameters || {},
      force_recalculate: forceRecalculate || false
    });
    
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Constant not found' });
    } else {
      console.error('Calculation error:', error);
      res.status(500).json({ error: 'Calculation failed' });
    }
  }
});

/**
 * @swagger
 * /api/playground/run:
 *   post:
 *     summary: Execute arbitrary formula in playground
 *     tags: [Playground]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - formula
 *               - parameters
 *             properties:
 *               formula:
 *                 type: string
 *                 description: Mathematical formula to evaluate
 *               parameters:
 *                 type: object
 *                 description: Parameter values
 *               outputUnit:
 *                 type: string
 *                 description: Optional output unit
 *     responses:
 *       200:
 *         description: Calculation result
 *       400:
 *         description: Invalid formula or parameters
 */
app.post('/api/playground/run', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/playground/run`, req.body);
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 400) {
      res.status(400).json({ error: error.response.data.detail });
    } else {
      console.error('Playground error:', error);
      res.status(500).json({ error: 'Playground execution failed' });
    }
  }
});

/**
 * @swagger
 * /api/dag:
 *   get:
 *     summary: Get dependency graph of all constants
 *     tags: [Graph]
 *     responses:
 *       200:
 *         description: DAG structure with nodes and edges
 */
app.get('/api/dag', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_SERVICE_URL}/dag`);
    res.json(response.data);
  } catch (error) {
    console.error('DAG error:', error);
    res.status(500).json({ error: 'Failed to load dependency graph' });
  }
});

// Serve static files for notebooks and JSON data
const staticBasePath = process.env.NODE_ENV === 'local' 
  ? join(__dirname, '../..') // In local mode, go up to project root
  : join(__dirname, '..');   // In Docker, constants is at ../constants

app.use('/constants/notebooks', express.static(join(staticBasePath, 'constants/notebooks')));
app.use('/constants/data', express.static(join(staticBasePath, 'constants/data')));
app.use('/compute/results', express.static(join(staticBasePath, 'constants/results')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'backend' });
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

// Start server
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/docs`);
}); 