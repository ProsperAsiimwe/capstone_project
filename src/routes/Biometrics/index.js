const { Router } = require('express');

const {
  BiometricController,
  BiometricAuthController,
} = require('@controllers/Biometrics');

const controller = new BiometricController();
const authController = new BiometricAuthController();

// BIOMETRICS API Endpoints
const bioRoutes = Router();

bioRoutes.get('/institution', controller.institution);
bioRoutes.post('/auth/login', authController.login);
bioRoutes.get('/auth/profile', authController.getAuthUserProfile);

module.exports = bioRoutes;
