import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import axios from 'axios';
import { toast } from 'sonner';
import { Timer, Send, Flag, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

const TakeTest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [markedForReview, setMarkedForReview] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showInstructions, setShowInstructions] = useState(true);
    const [visited, setVisited] = useState([]);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const response = await axios.get(`/api/tests/${id}`, {
                    withCredentials: true
                });
                setTest(response.data.data);
                setTimeLeft(response.data.data.duration * 60);
                setAnswers(new Array(response.data.data.questions.length).fill(-1));
                setMarkedForReview(new Array(response.data.data.questions.length).fill(false));
                setVisited(new Array(response.data.data.questions.length).fill(false));
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error fetching test');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [id, navigate]);

    useEffect(() => {
        if (!showInstructions && timeLeft <= 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            if (!showInstructions) {
                setTimeLeft(prev => prev - 1);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, showInstructions]);

    const handleAnswerChange = (value) => {
        setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[currentQuestion] = parseInt(value);
            return newAnswers;
        });
    };

    const handleMarkForReview = () => {
        setMarkedForReview(prev => {
            const newMarked = [...prev];
            newMarked[currentQuestion] = !newMarked[currentQuestion];
            return newMarked;
        });
    };

    const navigateQuestion = (index) => {
        setCurrentQuestion(index);
        setVisited(prev => {
            const newVisited = [...prev];
            newVisited[index] = true;
            return newVisited;
        });
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            const response = await axios.post(`/api/tests/${id}/submit`, {
                answers
            }, {
                withCredentials: true
            });

            toast.success('Test submitted successfully');
            navigate('/test-results', {
                state: {
                    result: response.data.data
                }
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error submitting test');
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getQuestionStatus = (index) => {
        if (markedForReview[index]) return 'review';
        if (answers[index] !== -1) return 'answered';
        if (visited[index]) return 'visited';
        return 'not-visited';
    };

    if (loading) {
        return (
            <div>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (showInstructions) {
        return (
            <div>
                <div className="max-w-3xl mx-auto p-6">
                    <Card className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Test Instructions</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Test Details:</h3>
                                <ul className="list-disc list-inside mt-2 space-y-2">
                                    <li>Duration: {test.duration} minutes</li>
                                    <li>Total Questions: {test.questions.length}</li>
                                    <li>Maximum Marks: {test.totalMarks}</li>
                                    <li>Passing Marks: {test.passingMarks}</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Important Instructions:</h3>
                                <ul className="list-disc list-inside mt-2 space-y-2">
                                    <li>The timer will start once you begin the test</li>
                                    <li>Do not refresh the page or close the browser window</li>
                                    <li>You can mark questions for review and return to them later</li>
                                    <li>Questions marked for review will be considered for evaluation</li>
                                    <li>The test will be auto-submitted when the timer expires</li>
                                </ul>
                            </div>
                            <Button 
                                className="w-full mt-6" 
                                onClick={() => setShowInstructions(false)}
                            >
                                Start Test
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="max-w-7xl mx-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Question Panel */}
                    <div className="md:col-span-3">
                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">
                                    Question {currentQuestion + 1} of {test.questions.length}
                                </h2>
                                <div className="flex items-center gap-2 text-lg font-semibold">
                                    <Timer className="w-5 h-5" />
                                    <span className={timeLeft < 300 ? 'text-red-500' : ''}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-lg">{test.questions[currentQuestion].question}</p>
                                </div>

                                <RadioGroup
                                    value={answers[currentQuestion].toString()}
                                    onValueChange={handleAnswerChange}
                                    className="space-y-4"
                                >
                                    {test.questions[currentQuestion].options.map((option, index) => (
                                        <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                                            <RadioGroupItem
                                                value={index.toString()}
                                                id={`option-${index}`}
                                            />
                                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                                {option}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>

                                <div className="flex justify-between items-center pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigateQuestion(Math.max(0, currentQuestion - 1))}
                                        disabled={currentQuestion === 0}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Previous
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        onClick={handleMarkForReview}
                                    >
                                        <Flag className={`w-4 h-4 mr-2 ${markedForReview[currentQuestion] ? 'text-yellow-500' : ''}`} />
                                        {markedForReview[currentQuestion] ? 'Marked for Review' : 'Mark for Review'}
                                    </Button>

                                    {currentQuestion === test.questions.length - 1 ? (
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Test
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => navigateQuestion(Math.min(test.questions.length - 1, currentQuestion + 1))}
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Question Navigation Panel */}
                    <div className="md:col-span-1">
                        <Card className="p-4">
                            <h3 className="font-semibold mb-4">Question Navigation</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {test.questions.map((_, index) => {
                                    const status = getQuestionStatus(index);
                                    return (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className={`h-10 ${
                                                status === 'answered' ? 'bg-green-100 hover:bg-green-200 border-green-500' :
                                                status === 'review' ? 'bg-yellow-100 hover:bg-yellow-200 border-yellow-500' :
                                                status === 'visited' ? 'bg-red-100 hover:bg-red-200 border-red-500' :
                                                'bg-gray-100 hover:bg-gray-200'
                                            } ${currentQuestion === index ? 'ring-2 ring-primary' : ''}`}
                                            onClick={() => navigateQuestion(index)}
                                        >
                                            {index + 1}
                                        </Button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
                                    <span>Answered</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded"></div>
                                    <span>Marked for Review</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div>
                                    <span>Not Answered</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-4 h-4 bg-gray-100 border rounded"></div>
                                    <span>Not Visited</span>
                                </div>
                            </div>

                            <Button
                                className="w-full mt-6"
                                variant="destructive"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Submit Test
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TakeTest; 