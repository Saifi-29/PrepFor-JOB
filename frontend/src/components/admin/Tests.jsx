import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TEST_API_END_POINT } from '@/utils/constant';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { token } = useSelector(store => store.auth);

  useEffect(() => {
    if (!token) {
      toast({
        title: "Error",
        description: "Please login first",
        variant: "destructive",
      });
      return;
    }
    fetchTests();
  }, [token]);

  const fetchTests = async () => {
    try {
      const response = await axios.get(TEST_API_END_POINT, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      if (response.data.success) {
        setTests(response.data.data || []);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to fetch tests",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch tests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;

    try {
      const response = await axios.delete(`${TEST_API_END_POINT}/${testId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Test deleted successfully!",
        });
        fetchTests(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to delete test",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete test",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tests</h1>
        <Link to="/admin/tests/create">
          <Button>Create New Test</Button>
        </Link>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-8">
          <p>No tests found. Create your first test!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test) => (
            <Card key={test._id} className="p-4">
              <h2 className="text-xl font-semibold mb-2">{test.title}</h2>
              <p className="text-gray-600 mb-4">{test.description}</p>
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => deleteTest(test._id)}>
                  Delete
                </Button>
                <Link to={`/admin/tests/${test._id}`}>
                  <Button>View Details</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tests; 