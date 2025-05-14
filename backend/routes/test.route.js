import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { restrictTo } from '../middlewares/restrictTo.js';
import {
    createTest,
    getAllTests,
    getTestById,
    updateTest,
    deleteTest,
    submitTest,
    getAvailableTests,
    getTestResults
} from '../controllers/test.controller.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(isAuthenticated);

// Recruiter only routes
router.route('/')
    .post(restrictTo('recruiter'), createTest)
    .get(restrictTo('recruiter'), getAllTests);

// Student only routes - SPECIFIC ROUTES FIRST
router.get('/available', restrictTo('student'), getAvailableTests);

// Parameterized routes
router.route('/:id')
    .get(getTestById)
    .patch(restrictTo('recruiter'), updateTest)
    .delete(restrictTo('recruiter'), deleteTest);

router.route('/:id/submit').post(restrictTo('student'), submitTest);
router.route('/:id/results').get(getTestResults);

export default router; 