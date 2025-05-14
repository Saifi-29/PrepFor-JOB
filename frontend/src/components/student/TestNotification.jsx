import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TEST_API_END_POINT } from '@/utils/constant';
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Award, BookOpen } from 'lucide-react';

const TestNotification = () => {
  const [availableTests, setAvailableTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { token, user } = useSelector(store => store.auth);

  useEffect(() => {
    if (!token || user?.role !== 'student') {
      setLoading(false);
      return;
    }
    fetchAvailableTests();
  }, [token, user]);

  const fetchAvailableTests = async () => {
    try {
      const response = await axios.get(`${TEST_API_END_POINT}/student/available`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });

      if (response.data.success) {
        console.log('Available tests:', response.data);
        setAvailableTests(response.data.data || []);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to fetch available tests",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch available tests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user?.role === 'student') {
    return null;
  }

  if (loading) {
    return (
      <Card className="p-4 mb-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex justify-center items-center h-24">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        </div>
      </Card>
    );
  }

  if (availableTests.length === 0) {
    return (
      <Card className="p-4 mb-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="text-center py-6">
          <h3 className="text-lg font-semibold mb-2">No Tests Available</h3>
          <p className="text-sm text-gray-600">
            Check back later for new aptitude tests.
          </p>
          <Link to="/jobs">
            <Button variant="default" className="mt-4 bg-purple-600 hover:bg-purple-700">
              Browse Jobs
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-4 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">Available Tests</h2>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-600">
          {availableTests.length} Available
        </Badge>
      </div>
      <div className="space-y-3">
        {availableTests.map((test) => (
          <div key={test._id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="font-medium text-lg">{test.title}</h3>
                {test.jobId && (
                  <p className="text-sm text-gray-500">
                    Associated Job: {test.jobId?.title || 'Unknown Job'} at {test.jobId?.company?.name || 'Unknown Company'}
                  </p>
                )}
                <p className="text-sm text-gray-600">{test.description}</p>
                <div className="flex gap-3 mt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{test.duration}m</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Award className="h-4 w-4" />
                    <span>{test.totalMarks} marks</span>
                  </div>
                </div>
              </div>
              <Link to={`/tests/${test._id}`}>
                <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Take Test
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TestNotification; 