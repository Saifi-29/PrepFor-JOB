import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TEST_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';

const CreateTest = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { token } = useSelector(store => store.auth);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    jobId: '',
    questions: [{ 
      question: '', 
      options: ['', '', '', ''], 
      correctOption: 0,
      marks: 1 
    }]
  });

  useEffect(() => {
    // Fetch jobs for the select dropdown
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${JOB_API_END_POINT}/getadminjobs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });
        
        if (response.data.success) {
          setJobs(response.data.jobs);
          if (response.data.jobs.length === 0) {
            toast({
              title: "Warning",
              description: "No jobs found. Please create a job first.",
              variant: "warning",
            });
          }
        } else {
          toast({
            title: "Error",
            description: response.data.message || "Failed to fetch jobs",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch jobs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchJobs();
    } else {
      setLoading(false);
      toast({
        title: "Error",
        description: "Please login first",
        variant: "destructive",
      });
    }
  }, [token, toast]);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...testData.questions];
    if (field === 'options') {
      newQuestions[index].options = value;
    } else {
      newQuestions[index][field] = value;
    }
    setTestData({ ...testData, questions: newQuestions });
  };

  const addQuestion = () => {
    setTestData({
      ...testData,
      questions: [...testData.questions, {
        question: '',
        options: ['', '', '', ''],
        correctOption: 0,
        marks: 1
      }]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = testData.questions.filter((_, i) => i !== index);
    setTestData({ ...testData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!testData.jobId) {
      toast({
        title: "Error",
        description: "Please select a job for this test",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Error",
        description: "Please login first",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        TEST_API_END_POINT,
        testData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Test created successfully!",
        });
        navigate('/admin/tests');
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to create test",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create test",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Aptitude Test</h2>
      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Test Title</Label>
            <Input
              id="title"
              value={testData.title}
              onChange={(e) => setTestData({ ...testData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={testData.description}
              onChange={(e) => setTestData({ ...testData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job">Select Job</Label>
            {loading ? (
              <div className="text-sm text-gray-500">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="text-sm text-red-500">
                No jobs available. Please create a job first.
              </div>
            ) : (
              <Select
                value={testData.jobId}
                onValueChange={(value) => setTestData({ ...testData, jobId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job._id} value={job._id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={testData.duration}
                onChange={(e) => setTestData({ ...testData, duration: parseInt(e.target.value) })}
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                value={testData.totalMarks}
                onChange={(e) => setTestData({ ...testData, totalMarks: parseInt(e.target.value) })}
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passingMarks">Passing Marks</Label>
              <Input
                id="passingMarks"
                type="number"
                value={testData.passingMarks}
                onChange={(e) => setTestData({ ...testData, passingMarks: parseInt(e.target.value) })}
                required
                min="1"
                max={testData.totalMarks}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Button type="button" onClick={addQuestion}>Add Question</Button>
            </div>

            {testData.questions.map((question, qIndex) => (
              <Card key={qIndex} className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Question {qIndex + 1}</h4>
                  {testData.questions.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label>Options</Label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...question.options];
                          newOptions[oIndex] = e.target.value;
                          handleQuestionChange(qIndex, 'options', newOptions);
                        }}
                        placeholder={`Option ${oIndex + 1}`}
                        required
                      />
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctOption === oIndex}
                        onChange={() => handleQuestionChange(qIndex, 'correctOption', oIndex)}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="w-24">
                  <Label>Marks</Label>
                  <Input
                    type="number"
                    value={question.marks}
                    onChange={(e) => handleQuestionChange(qIndex, 'marks', parseInt(e.target.value))}
                    required
                    min="1"
                  />
                </div>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full">Create Test</Button>
        </Card>
      </form>
    </div>
  );
};

export default CreateTest; 