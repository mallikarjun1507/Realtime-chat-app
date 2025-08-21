const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { NODE_ENV, CLIENT_ORIGINS } = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// ✅ Dynamic CORS with allowed origins from env.js
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow mobile apps/Postman
    if (CLIENT_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, env: NODE_ENV }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', userRoutes); // ensures /api/conversations/:id/messages works
app.use('/api/messages', messageRoutes);

app.use((req, res) => res.status(404).json({ message: 'Not found' }));

module.exports = app;
