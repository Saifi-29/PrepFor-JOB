import { Test } from '../models/test.model.js';
import { TestResult } from '../models/testResult.model.js';
import { Application } from '../models/application.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Create a new test
export const createTest = catchAsync(async (req, res) => {
    const test = await Test.create({
        ...req.body,
        createdBy: req.id
    });

    res.status(201).json({
        success: true,
        data: test
    });
});

// Get all tests (for admin/recruiter)
export const getAllTests = catchAsync(async (req, res) => {
    const tests = await Test.find({ createdBy: req.id })
        .populate('jobId', 'title company')
        .exec();

    res.status(200).json({
        success: true,
        data: tests || [] // Ensure we always return an array
    });
});

// Get available tests (for students)
export const getAvailableTests = catchAsync(async (req, res, next) => {
    try {
        // Get all tests that the student hasn't attempted yet
        const attemptedTests = await TestResult.find({ userId: req.id }).distinct('testId');
        console.log('Attempted tests:', attemptedTests);
        
        // Find all active tests that haven't been attempted yet
        const tests = await Test.find({
            _id: { $nin: attemptedTests || [] },
            isActive: { $ne: false } // Show tests that are either active or undefined
        })
        .populate({
            path: 'jobId',
            select: 'title company',
            populate: {
                path: 'company',
                select: 'name'
            }
        })
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .select('title description duration totalMarks jobId createdAt')
        .exec();

        console.log('Available tests found:', tests.length);

        res.status(200).json({
            success: true,
            data: tests || []
        });
    } catch (error) {
        console.error('Error in getAvailableTests:', error);
        return next(new AppError('Error fetching available tests', 500));
    }
});

// Get test by ID
export const getTestById = catchAsync(async (req, res, next) => {
    const test = await Test.findById(req.params.id)
        .populate('jobId', 'title company');

    if (!test) {
        return next(new AppError('Test not found', 404));
    }

    // If requesting user is a student, remove correct answers
    if (req.role === 'student') {
        test.questions = test.questions.map(q => ({
            ...q.toObject(),
            correctOption: undefined
        }));
    }

    res.status(200).json({
        success: true,
        data: test
    });
});

// Update test
export const updateTest = catchAsync(async (req, res, next) => {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
        return next(new AppError('Test not found', 404));
    }

    // Only the creator can update the test
    if (test.createdBy.toString() !== req.id) {
        return next(new AppError('Not authorized to update this test', 403));
    }

    Object.assign(test, req.body);
    await test.save();

    res.status(200).json({
        success: true,
        data: test
    });
});

// Delete test
export const deleteTest = catchAsync(async (req, res, next) => {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
        return next(new AppError('Test not found', 404));
    }

    // Only the creator can delete the test
    if (test.createdBy.toString() !== req.id) {
        return next(new AppError('Not authorized to delete this test', 403));
    }

    await test.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Test deleted successfully'
    });
});

// Submit test
export const submitTest = catchAsync(async (req, res, next) => {
    const { answers } = req.body;
    const test = await Test.findById(req.params.id);

    if (!test) {
        return next(new AppError('Test not found', 404));
    }

    // Check if user has already attempted this test
    const existingAttempt = await TestResult.findOne({
        testId: test._id,
        userId: req.id
    });

    if (existingAttempt) {
        return next(new AppError('You have already attempted this test', 400));
    }

    // Calculate score
    let score = 0;
    answers.forEach((answer, index) => {
        if (answer === test.questions[index].correctOption) {
            score++;
        }
    });

    // Create test result
    const result = await TestResult.create({
        testId: test._id,
        userId: req.id,
        answers,
        score,
        totalQuestions: test.questions.length
    });

    res.status(201).json({
        success: true,
        data: {
            score,
            totalQuestions: test.questions.length
        }
    });
});

// Get test results
export const getTestResults = catchAsync(async (req, res, next) => {
    const test = await Test.findById(req.params.id);
    if (!test) {
        return next(new AppError('Test not found', 404));
    }

    // For recruiters, get all results for their test
    // For students, get only their own result
    const query = req.role === 'recruiter'
        ? { testId: test._id }
        : { testId: test._id, userId: req.id };

    const results = await TestResult.find(query)
        .populate('userId', 'name email')
        .select('-answers'); // Don't send answers back

    res.status(200).json({
        success: true,
        data: results
    });
}); 