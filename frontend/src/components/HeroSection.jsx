import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Search, Loader2, Target, BookOpen, BrainCircuit, GraduationCap } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';

const popupMessages = [
  "Tip: Keep your resume under 2 pages!",
  "Did you know? 70% of jobs aren't advertised online.",
  "Pro Tip: Customize your cover letter for each job.",
  "Reminder: Practice common interview questions!",
];

const skillsDatabase = {
    roles: {
        frontend: {
            keywords: ['frontend', 'front-end', 'front end', 'ui developer', 'react', 'angular', 'vue'],
            coreSkills: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
            frameworks: ['React', 'Angular', 'Vue.js', 'Next.js', 'Svelte'],
            tools: ['Webpack', 'Babel', 'npm/yarn', 'Git', 'Chrome DevTools'],
            concepts: ['Web Performance', 'Cross-browser Compatibility', 'SEO Basics', 'Web Accessibility']
        },
        backend: {
            keywords: ['backend', 'back-end', 'back end', 'server-side', 'api developer'],
            coreSkills: ['Node.js', 'Python', 'Java', 'C#', 'PHP'],
            frameworks: ['Express.js', 'Django', 'Spring Boot', 'Laravel', '.NET Core'],
            databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'],
            concepts: ['RESTful APIs', 'Authentication', 'Database Design', 'Server Architecture']
        },
        fullstack: {
            keywords: ['full stack', 'fullstack', 'full-stack'],
            coreSkills: ['JavaScript', 'Python', 'Java', 'HTML/CSS'],
            frontend: ['React', 'Angular', 'Vue.js'],
            backend: ['Node.js', 'Express.js', 'Django'],
            databases: ['MongoDB', 'PostgreSQL', 'MySQL'],
            concepts: ['Web Architecture', 'API Design', 'DevOps Basics']
        },
        cpp: {
            keywords: ['c++', 'cpp', 'c plus plus'],
            coreSkills: ['C++11/14/17', 'STL', 'Object-Oriented Programming'],
            tools: ['GCC/G++', 'CMake', 'Visual Studio', 'GDB'],
            concepts: ['Memory Management', 'Multithreading', 'Design Patterns', 'Data Structures'],
            domains: ['System Programming', 'Game Development', 'Embedded Systems']
        },
        devops: {
            keywords: ['devops', 'dev ops', 'dev-ops', 'sre', 'site reliability'],
            coreSkills: ['Linux', 'Shell Scripting', 'Python', 'Git'],
            tools: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
            clouds: ['AWS', 'Azure', 'GCP'],
            concepts: ['CI/CD', 'Infrastructure as Code', 'Monitoring', 'Security']
        }
    },
    soft: ['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Time Management', 'Adaptability']
};

const learningResources = {
    frontend: [
        'Frontend Masters - Complete Web Development Path',
        'React Documentation and Tutorials',
        'CSS Tricks for Modern Layouts',
        'Web.dev by Google for Performance'
    ],
    backend: [
        'Node.js Official Documentation',
        'Python Django Tutorial',
        'Database Design Fundamentals',
        'API Design Best Practices'
    ],
    cpp: [
        'C++ Reference Documentation',
        'Modern C++ Tutorial',
        'Data Structures and Algorithms in C++',
        'System Design Principles'
    ],
    devops: [
        'Docker and Kubernetes Documentation',
        'Cloud Certification Courses',
        'Infrastructure as Code Tutorial',
        'DevOps Roadmap Guide'
    ]
};

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [popupText, setPopupText] = useState("");
    const [jobDescription, setJobDescription] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            const randomMessage = popupMessages[Math.floor(Math.random() * popupMessages.length)];
            setPopupText(randomMessage);
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 5000);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    const analyzeJobDescription = async () => {
        if (!jobDescription.trim()) return;

        setLoading(true);
        try {
            const text = jobDescription.toLowerCase();
            let detectedRole = null;
            let roleSpecificSkills = [];
            let recommendedSkills = [];
            let learningPaths = [];
            
            // Detect the primary role
            for (const [role, data] of Object.entries(skillsDatabase.roles)) {
                if (data.keywords.some(keyword => text.includes(keyword))) {
                    detectedRole = role;
                    break;
                }
            }

            // Role-specific analysis
            if (detectedRole) {
                const roleData = skillsDatabase.roles[detectedRole];
                
                // Add core skills
                roleSpecificSkills.push(...roleData.coreSkills.map(skill => ({
                    skill,
                    type: 'core',
                    required: true
                })));

                // Add role-specific skills
                switch(detectedRole) {
                    case 'frontend':
                        roleSpecificSkills.push(
                            ...roleData.frameworks.map(skill => ({
                                skill,
                                type: 'framework',
                                required: text.toLowerCase().includes(skill.toLowerCase())
                            })),
                            ...roleData.tools.map(skill => ({
                                skill,
                                type: 'tool',
                                required: text.toLowerCase().includes(skill.toLowerCase())
                            }))
                        );
                        break;
                    case 'backend':
                        roleSpecificSkills.push(
                            ...roleData.frameworks.map(skill => ({
                                skill,
                                type: 'framework',
                                required: text.toLowerCase().includes(skill.toLowerCase())
                            })),
                            ...roleData.databases.map(skill => ({
                                skill,
                                type: 'database',
                                required: text.toLowerCase().includes(skill.toLowerCase())
                            }))
                        );
                        break;
                    case 'cpp':
                        roleSpecificSkills.push(
                            ...roleData.tools.map(skill => ({
                                skill,
                                type: 'tool',
                                required: text.toLowerCase().includes(skill.toLowerCase())
                            })),
                            ...roleData.concepts.map(skill => ({
                                skill,
                                type: 'concept',
                                required: text.toLowerCase().includes(skill.toLowerCase())
                            }))
                        );
                        break;
                    case 'devops':
                        roleSpecificSkills.push(
                            ...roleData.tools.map(skill => ({
                                skill,
                                type: 'tool',
                                required: text.toLowerCase().includes(skill.toLowerCase())
                            })),
                            ...roleData.clouds.map(skill => ({
                                skill,
                                type: 'cloud',
                                required: text.toLowerCase().includes(skill.toLowerCase())
                            }))
                        );
                        break;
                }

                // Add learning resources
                learningPaths = learningResources[detectedRole] || [];
            }

            // Detect soft skills
            const softSkills = skillsDatabase.soft.filter(skill => 
                text.includes(skill.toLowerCase())
            );

            // Generate preparation steps based on role
            const preparationSteps = [];
            if (detectedRole) {
                const requiredSkills = roleSpecificSkills.filter(s => s.required).map(s => s.skill);
                preparationSteps.push(`Focus on mastering these key ${detectedRole} skills: ${requiredSkills.join(', ')}`);
                preparationSteps.push(`Study ${skillsDatabase.roles[detectedRole].concepts.join(', ')}`);
                
                switch(detectedRole) {
                    case 'frontend':
                        preparationSteps.push('Build a portfolio with responsive and interactive web applications');
                        preparationSteps.push('Practice cross-browser testing and optimization');
                        break;
                    case 'backend':
                        preparationSteps.push('Create RESTful APIs and practice database design');
                        preparationSteps.push('Implement authentication and security best practices');
                        break;
                    case 'cpp':
                        preparationSteps.push('Practice data structures and algorithms implementation');
                        preparationSteps.push('Work on memory management and optimization techniques');
                        break;
                    case 'devops':
                        preparationSteps.push('Set up CI/CD pipelines and containerized applications');
                        preparationSteps.push('Practice infrastructure automation and monitoring');
                        break;
                }
            }

            preparationSteps.push('Research the company and understand their tech stack');
            if (softSkills.length > 0) {
                preparationSteps.push(`Develop these soft skills: ${softSkills.join(', ')}`);
            }

            setAnalysis({
                role: detectedRole,
                skills: {
                    roleSpecific: roleSpecificSkills,
                    soft: softSkills
                },
                preparationSteps,
                learningPaths
            });

        } catch (error) {
            console.error('Error analyzing job description:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderSkillTag = (skill, type = 'default', required = false) => {
        const colorClasses = {
            core: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            framework: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            tool: 'bg-green-500/20 text-green-300 border-green-500/30',
            database: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            concept: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
            cloud: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
            soft: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
            default: 'bg-white/20 text-white border-white/30'
        };

        return (
            <span className={`px-3 py-1 rounded-full ${colorClasses[type]} text-sm font-medium ${required ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''}`}>
                {skill}
                {required && <span className="ml-1">*</span>}
            </span>
        );
    };

    return (
        <div className="relative overflow-hidden">
            {/* Background with animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 animate-gradient-x"></div>
            
            {/* Main content */}
            <div className="relative z-10 px-4 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block animate-bounce">
                            <span className="px-6 py-3 rounded-full bg-white/90 text-[#F83002] font-semibold shadow-xl border-2 border-[#F83002]/20">
                    Start Preparing for Jobs 👍
                </span>
                        </div>
                        
                        <h1 className="mt-8 text-6xl font-bold text-white leading-tight">
                            Search, Apply & Get Your<br />
                            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-transparent bg-clip-text">
                                Dream Jobs
                            </span>
                </h1>
                        
                        <p className="mt-6 text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                            Discover the best opportunities tailored to your skills and ambitions.
                            Start your career journey today.
                </p>

                {/* Enhanced Search Bar */}
                        <div className="mt-12 max-w-3xl mx-auto">
                            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-2xl p-3 border-2 border-white/20 shadow-xl">
                    <input
                        type="text"
                        placeholder="Find your dream jobs"
                        onChange={(e) => setQuery(e.target.value)}
                                    className="flex-grow bg-transparent outline-none text-white placeholder:text-white/70 px-4 py-2 text-lg"
                    />
                    <Button
                        onClick={searchJobHandler}
                                    className="px-8 py-6 rounded-xl bg-gradient-to-r from-[#F83002] to-[#ff6b4a] hover:from-[#ff6b4a] hover:to-[#F83002] transition-all duration-300 transform hover:scale-105"
                    >
                                    <Search className="h-5 w-5 mr-2" />
                                    Search
                    </Button>
                </div>
            </div>
                    </div>

                    {/* Career Tips & Blogs */}
                    <div className="mt-20">
                        <h2 className="text-3xl font-bold text-center text-white mb-12">
                            Career Tips & Resources
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            <div className="group hover:transform hover:scale-105 transition-all duration-300">
                                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/20 shadow-xl">
                                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 p-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Resume Writing Tips</h3>
                                    <p className="text-white/80">Learn how to create a resume that stands out and gets you noticed.</p>
                                </div>
                            </div>

                            <div className="group hover:transform hover:scale-105 transition-all duration-300">
                                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/20 shadow-xl">
                                    <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4 p-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Interview Preparation</h3>
                                    <p className="text-white/80">Master the art of interviewing with our comprehensive guides.</p>
                                </div>
                            </div>

                            <div className="group hover:transform hover:scale-105 transition-all duration-300">
                                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/20 shadow-xl">
                                    <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-4 p-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Career Growth</h3>
                                    <p className="text-white/80">Strategies and tips for advancing your career to the next level.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Description Analyzer */}
                    <div className="mt-20">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-500 text-transparent bg-clip-text">
                                Job Description Analyzer
                            </h2>
                            <p className="text-white/80 max-w-2xl mx-auto">
                                Paste any job description and get instant insights on required skills,
                                preparation tips, and recommended resources.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            {/* Input Section */}
                            <div>
                                <Card className="bg-white/10 backdrop-blur-lg border-2 border-white/20 p-6">
                                    <Textarea
                                        placeholder="Paste job description here..."
                                        className="min-h-[200px] bg-transparent border-white/20 text-white placeholder:text-white/50"
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                    />
                                    <Button
                                        className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-6"
                                        onClick={analyzeJobDescription}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            'Analyze Job Description'
                                        )}
                                    </Button>
                                </Card>
                            </div>

                            {/* Results Section */}
                            <div className="space-y-4">
                                {analysis && (
                                    <Card className="bg-white/10 backdrop-blur-lg border-2 border-white/20 p-6">
                                        <div className="space-y-6">
                                            {analysis.role && (
                                                <div className="mb-4">
                                                    <div className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-white/20">
                                                        <span className="text-white font-semibold">
                                                            Detected Role: {analysis.role.charAt(0).toUpperCase() + analysis.role.slice(1)} Developer
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Target className="h-5 w-5 text-emerald-400" />
                                                    <h3 className="text-lg font-semibold text-white">Required Skills</h3>
                                                </div>
                                                
                                                {analysis.skills.roleSpecific.length > 0 && (
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-medium text-white/70 mb-2">Technical Skills</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {analysis.skills.roleSpecific.map((item, index) => (
                                                                <span key={index}>
                                                                    {renderSkillTag(item.skill, item.type, item.required)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {analysis.skills.soft.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-white/70 mb-2">Soft Skills</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {analysis.skills.soft.map((skill, index) => (
                                                                <span key={index}>
                                                                    {renderSkillTag(skill, 'soft')}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <BrainCircuit className="h-5 w-5 text-cyan-400" />
                                                    <h3 className="text-lg font-semibold text-white">How to Prepare</h3>
                                                </div>
                                                <ul className="list-disc list-inside text-white/80 space-y-1">
                                                    {analysis.preparationSteps.map((step, index) => (
                                                        <li key={index}>{step}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {analysis.learningPaths.length > 0 && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <BookOpen className="h-5 w-5 text-purple-400" />
                                                        <h3 className="text-lg font-semibold text-white">Recommended Learning Resources</h3>
                                                    </div>
                                                    <ul className="list-disc list-inside text-white/80 space-y-1">
                                                        {analysis.learningPaths.map((resource, index) => (
                                                            <li key={index}>{resource}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animated Popup */}
            {showPopup && (
                <div className="fixed bottom-5 right-5 bg-white/10 backdrop-blur-lg border-2 border-white/20 shadow-xl px-6 py-4 rounded-xl text-white z-50 animate-fade-in-up">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        {popupText}
                    </div>
                </div>
            )}
        </div>
    )
}

export default HeroSection

// Add this to your global CSS file (src/index.css)
// @keyframes gradient-x {
//   0% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
//   100% { background-position: 0% 50%; }
// }
// .animate-gradient-x {
//   background-size: 200% 200%;
//   animation: gradient-x 15s ease infinite;
// }
