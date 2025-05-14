import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    passed: {
        type: Boolean,
        required: true
    },
    answers: [{
        type: Number,
        required: true
    }],
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure a user can only submit once per test
testResultSchema.index({ testId: 1, userId: 1 }, { unique: true });

export const TestResult = mongoose.model('TestResult', testResultSchema); 