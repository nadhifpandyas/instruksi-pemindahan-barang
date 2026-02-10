const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/authRoutes');

const ipbRoutes = require('./routes/ipbRoutes');

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'IPB API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ipbs', ipbRoutes);
app.use('/uploads', express.static('uploads')); // Serve uploaded files

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
