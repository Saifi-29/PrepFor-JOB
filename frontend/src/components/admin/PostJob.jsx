import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Textarea } from '../ui/textarea'

const PostJob = () => {
    const { toast } = useToast();
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experienceLevel: "",
        position: 1,
        companyId: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);
    const { token } = useSelector(store => store.auth);

    const changeEventHandler = (e) => {
        const value = e.target.type === 'number' ? 
            parseInt(e.target.value) || 0 : 
            e.target.value;
        setInput({ ...input, [e.target.name]: value });
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find((company) => company.name.toLowerCase() === value);
        setInput({ ...input, companyId: selectedCompany._id });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        // Validate all required fields
        const requiredFields = ['title', 'description', 'requirements', 'salary', 'location', 'jobType', 'experienceLevel', 'position', 'companyId'];
        const missingFields = requiredFields.filter(field => !input[field]);
        
        if (missingFields.length > 0) {
            toast({
                title: "Error",
                description: `Please fill in all required fields: ${missingFields.join(', ')}`,
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
            setLoading(true);
            const jobData = {
                title: input.title,
                description: input.description,
                requirements: input.requirements.split(',').map(req => req.trim()).filter(req => req),
                salary: parseInt(input.salary),
                experience: parseInt(input.experienceLevel),
                location: input.location,
                jobType: input.jobType,
                position: parseInt(input.position),
                companyId: input.companyId
            };

            console.log('Sending job data:', jobData);

            const response = await axios.post(
                'http://localhost:8000/api/v1/job/post',
                jobData,
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
                    description: "Job posted successfully!",
                });
                navigate("/admin/jobs");
            }
        } catch (error) {
            console.error('Error posting job:', error.response?.data || error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to post job. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center w-screen my-5'>
                <form onSubmit={submitHandler} className='p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md'>
                    <div className='grid grid-cols-2 gap-4'>
                        <div className="space-y-2">
                            <Label>Job Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                placeholder="e.g. Senior Software Engineer"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                placeholder="e.g. New York, NY"
                                required
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Job Description</Label>
                            <Textarea
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                placeholder="Describe the role and responsibilities"
                                required
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Requirements (comma-separated)</Label>
                            <Textarea
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                placeholder="e.g. 5+ years experience, Bachelor's degree, React expertise"
                                required
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Salary (per year)</Label>
                            <Input
                                type="number"
                                name="salary"
                                value={input.salary}
                                onChange={changeEventHandler}
                                placeholder="e.g. 100000"
                                required
                                min="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Job Type</Label>
                            <Select name="jobType" onValueChange={(value) => setInput({ ...input, jobType: value })} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full-time">Full Time</SelectItem>
                                    <SelectItem value="part-time">Part Time</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Experience Level (years)</Label>
                            <Input
                                type="number"
                                name="experienceLevel"
                                value={input.experienceLevel}
                                onChange={changeEventHandler}
                                placeholder="e.g. 5"
                                required
                                min="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Number of Positions</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                required
                                min="1"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Company</Label>
                            {companies.length > 0 ? (
                                <Select onValueChange={selectChangeHandler} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a Company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {companies.map((company) => (
                                                <SelectItem 
                                                    key={company._id}
                                                    value={company?.name?.toLowerCase()}
                                                >
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className='text-sm text-red-600'>Please create a company first</p>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <Button disabled className="w-full mt-6">
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Posting Job...
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full mt-6" disabled={companies.length === 0}>
                            Post New Job
                        </Button>
                    )}

                    {companies.length === 0 && (
                        <p className='text-xs text-red-600 font-medium text-center mt-3'>
                            *Please register a company first before posting jobs
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}

export default PostJob