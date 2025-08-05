import express from 'express';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// API Gateway URL - in production this should point to your backend service
const API_URL = process.env.API_URL || 'http://localhost:8000';

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  }
}));

// Proxy WebSocket connections
app.use('/ws', createProxyMiddleware({
  target: API_URL,
  ws: true,
  changeOrigin: true
}));

// Proxy static content requests
app.use('/constants', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true
}));

app.use('/compute', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true
}));

// Handle client-side routing - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Proxying API requests to ${API_URL}`);
});