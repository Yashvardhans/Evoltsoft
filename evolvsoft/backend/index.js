require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');       // Just import pool
const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, // if you need to send/receive cookies or auth headers
  })
);

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
