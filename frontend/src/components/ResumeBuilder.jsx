import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from 'axios';

const ResumeBuilder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
    },
    summary: '',
    experience: [{
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      achievements: ['']
    }],
    education: [{
      institution: '',
      degree: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
    }],
    skills: {
      technical: [''],
      soft: [''],
      languages: ['']
    },
    projects: [{
      name: '',
      technologies: '',
      description: '',
      link: ''
    }],
    certifications: [{
      name: '',
      issuer: '',
      date: '',
      link: ''
    }]
  });

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value
      }
    }));
  };

  // Experience handlers
  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        achievements: ['']
      }]
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience];
      newExperience[index] = {
        ...newExperience[index],
        [field]: value
      };
      return { ...prev, experience: newExperience };
    });
  };

  const addAchievement = (expIndex) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].achievements.push('');
      return { ...prev, experience: newExperience };
    });
  };

  const handleAchievementChange = (expIndex, achievementIndex, value) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].achievements[achievementIndex] = value;
      return { ...prev, experience: newExperience };
    });
  };

  // Education handlers
  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        location: '',
        startDate: '',
        endDate: '',
        gpa: '',
      }]
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setResumeData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = {
        ...newEducation[index],
        [field]: value
      };
      return { ...prev, education: newEducation };
    });
  };

  // Skills handlers
  const addSkill = (category) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: [...prev.skills[category], '']
      }
    }));
  };

  const handleSkillChange = (category, index, value) => {
    setResumeData(prev => {
      const newSkills = { ...prev.skills };
      newSkills[category][index] = value;
      return { ...prev, skills: newSkills };
    });
  };

  const removeSkill = (category, index) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter((_, i) => i !== index)
      }
    }));
  };

  // Projects handlers
  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: '',
        technologies: '',
        description: '',
        link: ''
      }]
    }));
  };

  const handleProjectChange = (index, field, value) => {
    setResumeData(prev => {
      const newProjects = [...prev.projects];
      newProjects[index] = {
        ...newProjects[index],
        [field]: value
      };
      return { ...prev, projects: newProjects };
    });
  };

  // Certifications handlers
  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        name: '',
        issuer: '',
        date: '',
        link: ''
      }]
    }));
  };

  const handleCertificationChange = (index, field, value) => {
    setResumeData(prev => {
      const newCertifications = [...prev.certifications];
      newCertifications[index] = {
        ...newCertifications[index],
        [field]: value
      };
      return { ...prev, certifications: newCertifications };
    });
  };

  const generatePDF = async () => {
    setLoading(true);
    setError('');
    try {
      // Filter out empty achievements
      const cleanedResumeData = {
        ...resumeData,
        experience: resumeData.experience.map(exp => ({
          ...exp,
          achievements: exp.achievements.filter(achievement => achievement.trim() !== '')
        })).filter(exp => exp.company || exp.position || exp.description),
        education: resumeData.education.filter(edu => edu.institution || edu.degree),
        skills: {
          technical: resumeData.skills.technical.filter(skill => skill.trim() !== ''),
          soft: resumeData.skills.soft.filter(skill => skill.trim() !== ''),
          languages: resumeData.skills.languages.filter(skill => skill.trim() !== '')
        },
        projects: resumeData.projects.filter(project => project.name || project.description),
        certifications: resumeData.certifications.filter(cert => cert.name || cert.issuer)
      };

      // Get the backend URL from environment variable or use default
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      
      const response = await axios.post(`${backendUrl}/api/resume/generate`, cleanedResumeData, {
        responseType: 'blob',
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        }
      });

      // Check if the response is actually a PDF
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/pdf')) {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        const fileName = cleanedResumeData.personalInfo.fullName.trim() 
          ? `${cleanedResumeData.personalInfo.fullName.replace(/\s+/g, '_')}_resume.pdf`
          : 'resume.pdf';
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // If the response is not a PDF, it might be an error message
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.message || 'Failed to generate resume. Please try again.');
          } catch {
            setError('Failed to generate resume. Please try again.');
          }
        };
        reader.readAsText(response.data);
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              setError(errorData.message || 'Failed to generate resume. Please try again.');
            } catch {
              setError('Failed to generate resume. Server error occurred.');
            }
          };
          reader.readAsText(error.response.data);
        } else {
          setError(error.response.data?.message || 'Failed to generate resume. Please try again.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Failed to generate resume. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await generatePDF();
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Professional Resume Builder</h1>
        <p className="text-gray-600">Create a professional LaTeX-formatted resume in minutes</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">Personal Information</span>
            <span className="text-sm text-gray-500">(Required)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name</label>
              <Input
                name="fullName"
                placeholder="John Doe"
                value={resumeData.personalInfo.fullName}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                name="email"
                type="email"
                placeholder="john@example.com"
                value={resumeData.personalInfo.email}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input
                name="phone"
                placeholder="+1 (555) 123-4567"
                value={resumeData.personalInfo.phone}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Location</label>
              <Input
                name="location"
                placeholder="City, State"
                value={resumeData.personalInfo.location}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">LinkedIn URL</label>
              <Input
                name="linkedin"
                placeholder="https://linkedin.com/in/johndoe"
                value={resumeData.personalInfo.linkedin}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">GitHub URL</label>
              <Input
                name="github"
                placeholder="https://github.com/johndoe"
                value={resumeData.personalInfo.github}
                onChange={handlePersonalInfoChange}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Professional Summary</h2>
          <Textarea
            placeholder="Write a compelling summary of your professional background, key achievements, and career goals..."
            value={resumeData.summary}
            onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
            className="h-32"
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
          {resumeData.experience.map((exp, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Company</label>
                  <Input
                    placeholder="Company Name"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Position</label>
                  <Input
                    placeholder="Job Title"
                    value={exp.position}
                    onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Location</label>
                  <Input
                    placeholder="City, State"
                    value={exp.location}
                    onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Date</label>
                  <Input
                    placeholder="MM/YYYY"
                    value={exp.startDate}
                    onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">End Date</label>
                  <Input
                    placeholder="MM/YYYY or Present"
                    value={exp.endDate}
                    onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium mb-1 block">Job Description</label>
                <Textarea
                  placeholder="Describe your role and responsibilities..."
                  value={exp.description}
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                  className="mb-4"
                />
                <div className="space-y-4">
                  <label className="text-sm font-medium block">Key Achievements</label>
                  {exp.achievements.map((achievement, achievementIndex) => (
                    <div key={achievementIndex} className="flex gap-2">
                      <Input
                        placeholder="Describe a key achievement or responsibility"
                        value={achievement}
                        onChange={(e) => handleAchievementChange(index, achievementIndex, e.target.value)}
                      />
                      {achievementIndex > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newExp = [...resumeData.experience];
                            newExp[index].achievements = exp.achievements.filter((_, i) => i !== achievementIndex);
                            setResumeData(prev => ({ ...prev, experience: newExp }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addAchievement(index)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Achievement
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" onClick={addExperience} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Work Experience
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Education</h2>
          {resumeData.education.map((edu, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Institution</label>
                  <Input
                    placeholder="University/College Name"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Degree</label>
                  <Input
                    placeholder="Degree and Major"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Location</label>
                  <Input
                    placeholder="City, State"
                    value={edu.location}
                    onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Date</label>
                  <Input
                    placeholder="MM/YYYY"
                    value={edu.startDate}
                    onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">End Date</label>
                  <Input
                    placeholder="MM/YYYY or Expected MM/YYYY"
                    value={edu.endDate}
                    onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">GPA</label>
                  <Input
                    placeholder="3.8/4.0"
                    value={edu.gpa}
                    onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" onClick={addEducation} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Skills</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Technical Skills</h3>
              <div className="space-y-2">
                {resumeData.skills.technical.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="e.g., JavaScript, Python, React"
                      value={skill}
                      onChange={(e) => handleSkillChange('technical', index, e.target.value)}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSkill('technical', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSkill('technical')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Technical Skill
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Soft Skills</h3>
              <div className="space-y-2">
                {resumeData.skills.soft.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="e.g., Leadership, Communication"
                      value={skill}
                      onChange={(e) => handleSkillChange('soft', index, e.target.value)}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSkill('soft', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSkill('soft')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Soft Skill
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Languages</h3>
              <div className="space-y-2">
                {resumeData.skills.languages.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="e.g., English (Native), Spanish (Fluent)"
                      value={skill}
                      onChange={(e) => handleSkillChange('languages', index, e.target.value)}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSkill('languages', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSkill('languages')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Language
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          {resumeData.projects.map((project, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Project Name</label>
                  <Input
                    placeholder="Project Title"
                    value={project.name}
                    onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Technologies Used</label>
                  <Input
                    placeholder="e.g., React, Node.js, MongoDB"
                    value={project.technologies}
                    onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Project Description</label>
                  <Textarea
                    placeholder="Describe the project, your role, and its impact..."
                    value={project.description}
                    onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Project Link</label>
                  <Input
                    placeholder="https://github.com/username/project"
                    value={project.link}
                    onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" onClick={addProject} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Certifications</h2>
          {resumeData.certifications.map((cert, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Certification Name</label>
                  <Input
                    placeholder="Certification Title"
                    value={cert.name}
                    onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Issuing Organization</label>
                  <Input
                    placeholder="e.g., AWS, Google, Microsoft"
                    value={cert.issuer}
                    onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Date</label>
                  <Input
                    placeholder="MM/YYYY"
                    value={cert.date}
                    onChange={(e) => handleCertificationChange(index, 'date', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Certification Link</label>
                  <Input
                    placeholder="URL to verify certification"
                    value={cert.link}
                    onChange={(e) => handleCertificationChange(index, 'link', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" onClick={addCertification} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </Button>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="px-8" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating LaTeX PDF...
              </>
            ) : (
              'Generate Professional Resume'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResumeBuilder; 