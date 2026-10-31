const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./src/app');

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🚀 Placement Management Server running on port ${port}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health Check: http://localhost:${port}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`⚠️ Port ${port} is currently in use. Automatically trying port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server failed to start:', err);
    }
  });
}

startServer(DEFAULT_PORT);
