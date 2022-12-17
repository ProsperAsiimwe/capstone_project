const { Router } = require('express');
const loginRequired = require('../../app/middleware/authRoute');

const graduatesRoutes = require('./resultRoutes');
const enrollmentRoutes = require('./enrollmentRoute');
const admissionRoutes = require('./admissionsRoute');
const financialRoutes = require('./financialRoute');

// API Endpoints
const biRoutes = Router();

biRoutes.use('/result-reports', [loginRequired], graduatesRoutes);

biRoutes.use('/enrollment-reports', [loginRequired], enrollmentRoutes);

biRoutes.use('/admission-reports', [loginRequired], admissionRoutes);

biRoutes.use('/financial-reports', [loginRequired], financialRoutes);

module.exports = biRoutes;
