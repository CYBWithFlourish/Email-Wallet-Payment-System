const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');

require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
