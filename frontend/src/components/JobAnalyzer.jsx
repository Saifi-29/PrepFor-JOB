import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Loader2, BookOpen, Target, GraduationCap, BrainCircuit } from 'lucide-react';

const JobAnalyzer = () => {
    const [jobDescription, setJobDescription] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const analyzeJobDescription = async () => {
        if (!jobDescription.trim()) return;

        setLoading(true);
        try {
            // This is a mock analysis. In a real application, you would call your backend API
            // which might use GPT or another AI service to analyze the job description
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
            
            const mockAnalysis = {
                keySkills: [
                    "React.js",
                    "Node.js",
                    "TypeScript",
                    "API Development",
                    "Database Management"
                ],
                preparationSteps: [
                    "Build a portfolio of full-stack projects",
                    "Practice coding challenges on platforms like LeetCode",
                    "Learn system design principles",
                    "Study common design patterns"
                ],
                learningResources: [
                    "Frontend Masters - React Courses",
                    "Node.js Official Documentation",
                    "TypeScript Handbook",
                    "System Design Primer on GitHub"
                ],
                certifications: [
                    "AWS Certified Developer",
                    "MongoDB Certified Developer",
                    "React Developer Certification"
                ]
            };
            
            setAnalysis(mockAnalysis);
        } catch (error) {
            console.error('Error analyzing job description:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-16 bg-gradient-to-b from-white/5 via-purple-900/10 to-transparent">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-500 text-transparent bg-clip-text">
                        Job Description Analyzer
                    </h2>
                    <p className="text-white/80 max-w-2xl mx-auto">
                        Paste any job description and get instant insights on required skills,
                        preparation tips, and recommended resources.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <Card className="bg-white/10 backdrop-blur-lg border-2 border-white/20 p-6">
                            <Textarea
                                placeholder="Paste job description here..."
                                className="min-h-[300px] bg-transparent border-white/20 text-white placeholder:text-white/50"
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
                            <div className="grid gap-4">
                                <Card className="bg-white/10 backdrop-blur-lg border-2 border-white/20 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Target className="h-6 w-6 text-emerald-400" />
                                        <h3 className="text-xl font-semibold text-white">Key Skills Required</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.keySkills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </Card>

                                <Card className="bg-white/10 backdrop-blur-lg border-2 border-white/20 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BrainCircuit className="h-6 w-6 text-cyan-400" />
                                        <h3 className="text-xl font-semibold text-white">How to Prepare</h3>
                                    </div>
                                    <ul className="list-disc list-inside text-white/80 space-y-2">
                                        {analysis.preparationSteps.map((step, index) => (
                                            <li key={index}>{step}</li>
                                        ))}
                                    </ul>
                                </Card>

                                <Card className="bg-white/10 backdrop-blur-lg border-2 border-white/20 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BookOpen className="h-6 w-6 text-purple-400" />
                                        <h3 className="text-xl font-semibold text-white">Learning Resources</h3>
                                    </div>
                                    <ul className="list-disc list-inside text-white/80 space-y-2">
                                        {analysis.learningResources.map((resource, index) => (
                                            <li key={index}>{resource}</li>
                                        ))}
                                    </ul>
                                </Card>

                                <Card className="bg-white/10 backdrop-blur-lg border-2 border-white/20 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <GraduationCap className="h-6 w-6 text-yellow-400" />
                                        <h3 className="text-xl font-semibold text-white">Recommended Certifications</h3>
                                    </div>
                                    <ul className="list-disc list-inside text-white/80 space-y-2">
                                        {analysis.certifications.map((cert, index) => (
                                            <li key={index}>{cert}</li>
                                        ))}
                                    </ul>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobAnalyzer;