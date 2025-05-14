import express from 'express';
import { generateResume } from '../controllers/resumeController.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

router.post('/generate', isAuthenticated, generateResume);

export default router; 