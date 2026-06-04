// Simple Express server for EasyPanel
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Stock Management System',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API routes placeholder
app.get('/api/items', (req, res) => {
  res.json({
    message: 'Items API - Coming soon',
    items: []
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Stock Management System</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .card { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; text-decoration: none; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Stock Management System</h1>
        <div class="card">
          <h2>System is Running!</h2>
          <p>Backend API is operational. Full application coming soon.</p>
          <p><strong>API Endpoints:</strong></p>
          <ul>
            <li><a href="/api/health">/api/health</a> - Health check</li>
            <li><a href="/api/items">/api/items</a> - Items API</li>
          </ul>
          <p><a href="/api/health" class="btn">Check Health</a></p>
        </div>
        <p><small>Deployed on EasyPanel | ${new Date().toLocaleString()}</small></p>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Web UI: http://localhost:${PORT}/`);
});