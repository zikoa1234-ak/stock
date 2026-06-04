// Simple Express server for EasyPanel
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Stock Management API',
    timestamp: new Date().toISOString()
  });
});

// Welcome message
app.get('/', (req, res) => {
  res.json({
    message: 'Stock Management API',
    endpoints: {
      health: '/api/health',
      docs: 'Coming soon...'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});