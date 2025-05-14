import { Job } from "../models/job.model.js";

// admin post krega job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        console.log('Received job data:', {
            title, description, requirements, salary, location, jobType, 
            experience, position, companyId, userId
        });

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false,
                missingFields: Object.entries({ title, description, requirements, salary, location, jobType, experience, position, companyId })
                    .filter(([_, value]) => !value)
                    .map(([key]) => key)
            });
        }

        // Ensure requirements is an array
        const requirementsArray = Array.isArray(requirements) ? requirements : [requirements];

        const job = await Job.create({
            title,
            description,
            requirements: requirementsArray,
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: Number(experience),
            position: Number(position),
            company: companyId,
            created_by: userId,
            applications: [] // Initialize empty applications array
        });

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.error('Error creating job:', error);
        return res.status(500).json({
            message: "Internal server error while creating job",
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
// student k liye
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// student
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
    }
}
// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        console.log('Fetching jobs for admin:', adminId);

        const jobs = await Job.find({ created_by: adminId })
            .populate({
                path: 'company',
                select: 'name description location' // Select specific fields you need
            })
            .sort({ createdAt: -1 }); // Sort by newest first

        console.log('Found jobs:', jobs.length);

        return res.status(200).json({
            jobs,
            success: true,
            message: jobs.length ? "Jobs fetched successfully" : "No jobs found"
        });
    } catch (error) {
        console.error('Error fetching admin jobs:', error);
        return res.status(500).json({
            message: "Error fetching jobs",
            success: false,
            error: error.message
        });
    }
}
