// server.js
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');
const initSockets = require('./sockets');

(async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    initSockets(server);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(` Server listening on http://0.0.0.0:${PORT}`);
      console.log(` Access from mobile at: http://<your-local-ip>:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
