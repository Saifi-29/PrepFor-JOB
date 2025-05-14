import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { CheckCircle2, XCircle, Trophy, ArrowLeft } from 'lucide-react';

const TestResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    if (!result) {
        navigate('/dashboard');
        return null;
    }

    const percentage = Math.round((result.score / result.totalMarks) * 100);

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Card className="p-8">
                <div className="text-center mb-8">
                    {result.passed ? (
                        <div className="text-green-500 flex justify-center mb-4">
                            <Trophy className="w-20 h-20" />
                        </div>
                    ) : (
                        <div className="text-red-500 flex justify-center mb-4">
                            <XCircle className="w-20 h-20" />
                        </div>
                    )}
                    
                    <h1 className="text-3xl font-bold mb-2">
                        {result.passed ? 'Congratulations!' : 'Test Completed'}
                    </h1>
                    <p className="text-gray-600">
                        {result.passed 
                            ? 'You have passed the test!'
                            : 'Keep practicing and try again!'}
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium">Your Score</span>
                        <span className="text-xl font-bold">
                            {result.score} / {result.totalMarks}
                        </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium">Percentage</span>
                        <span className="text-xl font-bold">{percentage}%</span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium">Status</span>
                        <div className="flex items-center gap-2">
                            {result.passed ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span className="font-bold text-green-500">Passed</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    <span className="font-bold text-red-500">Failed</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="w-full"
                        size="lg"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default TestResults; 