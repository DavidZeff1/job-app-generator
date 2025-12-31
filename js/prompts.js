const Prompts = {
    parseResume(resumeText) {
        return `Parse this resume. Return ONLY JSON:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "linkedIn": "", "github": "", "portfolio": "", "location": "" },
  "education": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": "", "coursework": [], "honors": "" }],
  "experience": [{ "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "achievements": [], "technologies": [] }],
  "projects": [{ "name": "", "shortDescription": "", "technologies": [], "link": "", "outcomes": "" }],
  "skills": { "technical": [], "tools": [], "databases": [], "cloud": [], "certifications": [], "languages": [] }
}

RESUME:
${resumeText}`;
    },
    
    generateDocuments(profileData, jobData, options, type) {
        return `Generate: ${type === 'resume' ? 'Resume' : type === 'coverLetter' ? 'Cover letter' : 'Both'}

PROFILE:
${JSON.stringify(profileData, null, 2)}

JOB: ${jobData.jobTitle} at ${jobData.companyName}
${jobData.jobDescription}

OPTIONS:
- Metrics: ${options.metrics ? 'YES' : 'NO - only use numbers from profile'}
- Summary: ${options.summary ? 'YES' : 'NO'}
- Bold keywords: ${options.boldKeywords ? 'YES' : 'NO'}
- Links: ${options.links ? 'YES' : 'NO'}
- Coursework: ${options.coursework ? 'YES' : 'NO'}
- Match job keywords: ${options.keywords ? 'YES' : 'NO'}
- Sections: ${options.sections.join(', ')}

${type !== 'coverLetter' ? `RESUME RULES:
- Concise bullets: 8-15 words max
- Action verbs: Built, Led, Designed, Deployed, Reduced, Increased
- Skills: plain text, NO ** markers, organize by category
${options.boldKeywords ? '- Bullets ONLY: wrap 1-2 key terms in **double asterisks** for emphasis' : '- NO ** markers anywhere'}
${options.boldKeywords ? '  Example: "Built **REST API** using Node.js, reducing latency by 40%"' : ''}
- ${options.metrics ? 'Add realistic metrics' : 'NO invented numbers, only from profile'}` : ''}

${type !== 'resume' ? `COVER LETTER:
- 3 paragraphs, under 200 words total
${options.boldKeywords ? '- Can use **bold** for company name or 1-2 key skills' : '- NO ** markers'}` : ''}

OUTPUT (JSON only, no markdown):
${this.getSchema(type, options)}`;
    },
    
    getSchema(type, options) {
        const resume = `"resume": {
  ${options.summary ? '"summary": "1-2 lines, no bold",' : '"summary": null,'}
  "skills": {
    "technical": ["Python", "JavaScript", "React", "Node.js"],
    "tools": ["Git", "Docker", "Kubernetes"],
    "databases": ["PostgreSQL", "MongoDB", "Redis"],
    "cloud": ["AWS", "GCP", "Azure"],
    "certifications": ["AWS Solutions Architect"],
    "languages": ["English", "Spanish"]
  },
  "experience": [{ 
    "title": "Software Engineer", 
    "company": "Company", 
    "location": "City", 
    "dates": "2020 - Present", 
    "bullets": ["Built **feature** improving X by Y%"] 
  }],
  "projects": [{ 
    "name": "Project Name", 
    "technologies": "React, Node.js", 
    ${options.links ? '"link": "github.com/user/repo",' : ''} 
    "bullets": ["Developed **component** for X"] 
  }],
  "education": [{ 
    "degree": "BS Computer Science", 
    "institution": "University", 
    "year": "2020", 
    "gpa": "3.8"
    ${options.coursework ? ', "coursework": "Data Structures, Algorithms"' : ''} 
  }]
}`;
        const cover = `"coverLetter": { 
  "greeting": "Dear Hiring Manager,", 
  "paragraphs": ["First paragraph...", "Second...", "Third..."], 
  "closing": "Sincerely,", 
  "signature": "Name" 
}`;
        
        if (type === 'resume') return `{ ${resume} }`;
        if (type === 'coverLetter') return `{ ${cover} }`;
        return `{ ${resume}, ${cover} }`;
    }
};
