import mongoose from 'mongoose';
import { Company } from '../models/company.model.js';
import { Job } from '../models/job.model.js';
import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const companies = [
    {
        name: "Google",
        description: "A leading technology company specializing in internet-related services and products.",
        website: "https://google.com",
        location: "Mountain View, CA",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/2048px-Google_%22G%22_Logo.svg.png"
    },
    {
        name: "Microsoft",
        description: "A multinational technology company that develops, manufactures, and sells computer software, consumer electronics, and services.",
        website: "https://microsoft.com",
        location: "Redmond, WA",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png"
    },
    {
        name: "Amazon",
        description: "A global technology company focusing on e-commerce, cloud computing, digital streaming, and artificial intelligence.",
        website: "https://amazon.com",
        location: "Seattle, WA",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png"
    },
    {
        name: "Meta",
        description: "A technology company that focuses on social networking, virtual reality, and other technology products and services.",
        website: "https://meta.com",
        location: "Menlo Park, CA",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/2560px-Meta_Platforms_Inc._logo.svg.png"
    },
    {
        name: "Apple",
        description: "A technology company that designs, develops, and sells consumer electronics, computer software, and services.",
        website: "https://apple.com",
        location: "Cupertino, CA",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png"
    }
];

const jobTemplates = [
    {
        title: "Senior Software Engineer",
        description: "We are looking for an experienced software engineer to join our team and help build scalable applications.",
        requirements: ["5+ years of experience in software development", "Strong knowledge of JavaScript/TypeScript", "Experience with cloud platforms", "Excellent problem-solving skills"],
        salary: 150000,
        experienceLevel: 5,
        location: "Remote",
        jobType: "full-time",
        position: 3
    },
    {
        title: "Product Manager",
        description: "Join our product team to help define and execute product strategy for our core services.",
        requirements: ["3+ years of product management experience", "Strong analytical skills", "Excellent communication skills", "Experience with agile methodologies"],
        salary: 130000,
        experienceLevel: 3,
        location: "Hybrid",
        jobType: "full-time",
        position: 2
    },
    {
        title: "UI/UX Designer",
        description: "Create beautiful and intuitive user interfaces for our web and mobile applications.",
        requirements: ["3+ years of UI/UX design experience", "Proficiency in Figma/Sketch", "Strong portfolio", "Understanding of user-centered design principles"],
        salary: 110000,
        experienceLevel: 3,
        location: "On-site",
        jobType: "full-time",
        position: 2
    },
    {
        title: "DevOps Engineer",
        description: "Help us build and maintain our cloud infrastructure and deployment pipelines.",
        requirements: ["4+ years of DevOps experience", "Strong knowledge of AWS/Azure", "Experience with Docker and Kubernetes", "Scripting skills in Python/Bash"],
        salary: 140000,
        experienceLevel: 4,
        location: "Remote",
        jobType: "full-time",
        position: 2
    },
    {
        title: "Data Scientist",
        description: "Join our data science team to build machine learning models and analyze large datasets.",
        requirements: ["MS/PhD in Computer Science or related field", "Strong background in ML/AI", "Experience with Python and data science libraries", "Good communication skills"],
        salary: 135000,
        experienceLevel: 3,
        location: "Hybrid",
        jobType: "full-time",
        position: 2
    },
    {
        title: "Frontend Developer Intern",
        description: "Learn and contribute to our frontend development team while gaining real-world experience.",
        requirements: ["Currently pursuing CS degree", "Knowledge of HTML/CSS/JavaScript", "Familiarity with React", "Strong learning attitude"],
        salary: 45000,
        experienceLevel: 0,
        location: "Remote",
        jobType: "internship",
        position: 5
    },
    {
        title: "Backend Developer",
        description: "Build robust and scalable backend services for our growing platform.",
        requirements: ["3+ years of backend development", "Experience with Node.js/Python", "Database design skills", "API development experience"],
        salary: 120000,
        experienceLevel: 3,
        location: "On-site",
        jobType: "full-time",
        position: 3
    },
    {
        title: "Mobile App Developer",
        description: "Develop and maintain our iOS and Android applications.",
        requirements: ["4+ years of mobile development", "Experience with Swift/Kotlin", "Understanding of mobile design patterns", "App Store deployment experience"],
        salary: 125000,
        experienceLevel: 4,
        location: "Hybrid",
        jobType: "full-time",
        position: 2
    },
    {
        title: "QA Engineer",
        description: "Ensure the quality of our products through manual and automated testing.",
        requirements: ["3+ years of QA experience", "Experience with test automation", "Knowledge of testing frameworks", "Strong attention to detail"],
        salary: 95000,
        experienceLevel: 3,
        location: "Remote",
        jobType: "full-time",
        position: 2
    },
    {
        title: "Technical Writer",
        description: "Create and maintain technical documentation for our products and APIs.",
        requirements: ["2+ years of technical writing experience", "Strong writing and editing skills", "Familiarity with API documentation", "Experience with documentation tools"],
        salary: 85000,
        experienceLevel: 2,
        location: "Remote",
        jobType: "full-time",
        position: 1
    }
];

async function seedData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
        console.log('Connected to MongoDB');

        // Create a recruiter user if not exists
        const hashedPassword = await bcrypt.hash('password123', 10);
        const recruiter = await User.findOneAndUpdate(
            { email: 'recruiter@test.com' },
            {
                fullname: 'Test Recruiter',
                email: 'recruiter@test.com',
                phoneNumber: '1234567890',
                password: hashedPassword,
                role: 'recruiter',
                profile: {
                    profilePhoto: 'https://ui-avatars.com/api/?name=Test+Recruiter'
                }
            },
            { upsert: true, new: true }
        );

        // Create companies
        for (const company of companies) {
            await Company.findOneAndUpdate(
                { name: company.name },
                { ...company, userId: recruiter._id },
                { upsert: true }
            );
        }

        // Get all companies
        const savedCompanies = await Company.find();

        // Create jobs for each company
        for (const company of savedCompanies) {
            // Select 2 random job templates for each company
            const shuffledJobs = [...jobTemplates].sort(() => 0.5 - Math.random());
            const selectedJobs = shuffledJobs.slice(0, 2);

            for (const jobTemplate of selectedJobs) {
                await Job.create({
                    ...jobTemplate,
                    company: company._id,
                    created_by: recruiter._id
                });
            }
        }

        console.log('Data seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData(); 