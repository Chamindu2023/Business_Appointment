const express = require("express");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use('/api/auth', require('./route/authroute'));
app.use('/api/appointment', require('./route/AppointmentRoute'));

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'Server is running', database: 'SQLite Connected' });
  } catch (error) {
    res.status(500).json({ status: 'Database Connection Error', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});