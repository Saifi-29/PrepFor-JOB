import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execPromise = promisify(exec);

// Check if LaTeX is installed
const checkLatexInstallation = async () => {
    try {
        const { stdout } = await execPromise('pdflatex --version');
        return stdout.includes('pdfTeX');
    } catch (error) {
        console.error('LaTeX check error:', error);
        return false;
    }
};

// Escape special LaTeX characters
const escapeLaTeX = (text) => {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/[&%$#_{}~^]/g, '\\$&')
        .replace(/\[/g, '{[}')
        .replace(/\]/g, '{]}');
};

export const generateResume = async (req, res) => {
    let tempDir = null;
    try {
        // Check if LaTeX is installed
        const isLatexInstalled = await checkLatexInstallation();
        if (!isLatexInstalled) {
            return res.status(500).json({
                success: false,
                message: 'LaTeX is not installed on the server. Please contact the administrator.'
            });
        }

        const { personalInfo, summary, experience, education, skills, projects, certifications } = req.body;
        
        // Validate required fields
        if (!personalInfo || !personalInfo.fullName) {
            return res.status(400).json({
                success: false,
                message: 'Full name is required'
            });
        }

        // Create a temporary directory for LaTeX files
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-'));
        const texFile = path.join(tempDir, 'resume.tex');
        
        // Generate LaTeX content with escaped special characters
        const latexContent = `
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\usepackage{fontawesome5}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{xcolor}

% Custom colors
\\definecolor{primary}{RGB}{106, 56, 194}
\\definecolor{secondary}{RGB}{159, 103, 228}

% Custom section format
\\titleformat{\\section}{\\Large\\bfseries}{}{0em}{\\color{primary}}[\\titlerule]
\\titlespacing*{\\section}{0pt}{12pt}{8pt}

% Custom subsection format
\\titleformat{\\subsection}{\\large\\bfseries}{}{0em}{\\color{secondary}}
\\titlespacing*{\\subsection}{0pt}{8pt}{4pt}

\\begin{document}

% Header
\\begin{center}
    {\\Huge\\bfseries ${escapeLaTeX(personalInfo.fullName)}}\\\\[0.5em]
    {\\small
        ${personalInfo.email ? `\\faEnvelope\\ \\href{mailto:${escapeLaTeX(personalInfo.email)}}{${escapeLaTeX(personalInfo.email)}}` : ''}
        ${personalInfo.phone ? `| \\faPhone\\ ${escapeLaTeX(personalInfo.phone)}` : ''}
        ${personalInfo.location ? `| \\faMapMarker\\ ${escapeLaTeX(personalInfo.location)}` : ''}
        ${personalInfo.linkedin ? `| \\faLinkedin\\ \\href{${escapeLaTeX(personalInfo.linkedin)}}{LinkedIn}` : ''}
        ${personalInfo.github ? `| \\faGithub\\ \\href{${escapeLaTeX(personalInfo.github)}}{GitHub}` : ''}
    }
\\end{center}

% Summary
${summary ? `\\section{Professional Summary}
${escapeLaTeX(summary)}` : ''}

% Experience
${experience && experience.length > 0 ? `\\section{Professional Experience}
${experience.map(exp => `
\\subsection{${escapeLaTeX(exp.position || '')} ${exp.company ? `| ${escapeLaTeX(exp.company)}` : ''}}
${exp.location || exp.startDate || exp.endDate ? `\\textit{${[escapeLaTeX(exp.location), `${escapeLaTeX(exp.startDate || '')} - ${escapeLaTeX(exp.endDate || '')}`].filter(Boolean).join(' | ')}}` : ''}
${exp.description || exp.achievements.length > 0 ? `\\begin{itemize}[leftmargin=*]
    ${exp.description ? `\\item ${escapeLaTeX(exp.description)}` : ''}
    ${exp.achievements.filter(a => a).map(achievement => `\\item ${escapeLaTeX(achievement)}`).join('\n    ')}
\\end{itemize}` : ''}
`).join('\n')}` : ''}

% Education
${education && education.length > 0 ? `\\section{Education}
${education.map(edu => `
\\subsection{${escapeLaTeX(edu.degree || '')} ${edu.institution ? `| ${escapeLaTeX(edu.institution)}` : ''}}
${edu.location || edu.startDate || edu.endDate ? `\\textit{${[escapeLaTeX(edu.location), `${escapeLaTeX(edu.startDate || '')} - ${escapeLaTeX(edu.endDate || '')}`].filter(Boolean).join(' | ')}}` : ''}
${edu.gpa ? `\\textbf{GPA:} ${escapeLaTeX(edu.gpa)}` : ''}
`).join('\n')}` : ''}

% Skills
${skills && (skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0) ? `\\section{Skills}
${skills.technical.length > 0 ? `\\subsection{Technical Skills}
${skills.technical.filter(s => s).map(s => escapeLaTeX(s)).join(', ')}` : ''}

${skills.soft.length > 0 ? `\\subsection{Soft Skills}
${skills.soft.filter(s => s).map(s => escapeLaTeX(s)).join(', ')}` : ''}

${skills.languages.length > 0 ? `\\subsection{Languages}
${skills.languages.filter(s => s).map(s => escapeLaTeX(s)).join(', ')}` : ''}` : ''}

% Projects
${projects && projects.length > 0 ? `\\section{Projects}
${projects.map(project => `
\\subsection{${escapeLaTeX(project.name || 'Project')}}
${project.technologies ? `\\textit{Technologies: ${escapeLaTeX(project.technologies)}}` : ''}
${project.link ? `\\\\\\href{${escapeLaTeX(project.link)}}{Project Link}` : ''}
${project.description ? `\\begin{itemize}[leftmargin=*]
    \\item ${escapeLaTeX(project.description)}
\\end{itemize}` : ''}
`).join('\n')}` : ''}

% Certifications
${certifications && certifications.length > 0 ? `\\section{Certifications}
${certifications.map(cert => `
\\subsection{${escapeLaTeX(cert.name || '')}}
${cert.issuer || cert.date ? `\\textit{${[escapeLaTeX(cert.issuer), escapeLaTeX(cert.date)].filter(Boolean).join(' | ')}}` : ''}
${cert.link ? `\\\\\\href{${escapeLaTeX(cert.link)}}{Certification Link}` : ''}
`).join('\n')}` : ''}

\\end{document}
`;

        // Write LaTeX content to file
        await fs.writeFile(texFile, latexContent, 'utf8');

        try {
            // Compile LaTeX to PDF (run twice for proper formatting)
            const { stderr: stderr1 } = await execPromise(`cd ${tempDir} && pdflatex -interaction=nonstopmode resume.tex`);
            if (stderr1) console.log('First compilation warnings:', stderr1);
            
            const { stderr: stderr2 } = await execPromise(`cd ${tempDir} && pdflatex -interaction=nonstopmode resume.tex`);
            if (stderr2) console.log('Second compilation warnings:', stderr2);

            // Read the generated PDF
            const pdfPath = path.join(tempDir, 'resume.pdf');
            const pdfContent = await fs.readFile(pdfPath);

            // Clean up temporary directory
            await fs.rm(tempDir, { recursive: true, force: true });
            tempDir = null;

            // Send PDF to client
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${personalInfo.fullName.replace(/\s+/g, '_')}_resume.pdf`);
            res.send(pdfContent);
        } catch (error) {
            console.error('LaTeX compilation error:', error);
            throw new Error(`LaTeX compilation failed: ${error.message}`);
        }

    } catch (error) {
        console.error('Error generating resume:', error);
        // Clean up temporary directory if it exists
        if (tempDir) {
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.error('Error cleaning up temporary directory:', cleanupError);
            }
        }
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to generate resume',
            error: error.message 
        });
    }
};