const express = require('express');
const router = express.Router();
const { createPublicAppointment } = require('../controllers/AppoinmentController');

// This resolves to POST /api/public/appointments
router.post('/appointments', createPublicAppointment);

module.exports = router;