const Config = {
    API_MODEL: 'claude-sonnet-4-20250514',
    API_VERSION: '2023-06-01',
    API_URL: 'https://api.anthropic.com/v1/messages',
    MAX_TOKENS: 4096,
    
    STORAGE_KEYS: {
        API_KEY: 'jobAppGenerator_apiKey',
        PERSONAL_INFO: 'jobAppGenerator_personalInfo',
        EDUCATION: 'jobAppGenerator_education',
        EXPERIENCE: 'jobAppGenerator_experience',
        PROJECTS: 'jobAppGenerator_projects',
        SKILLS: 'jobAppGenerator_skills',
        THEME: 'jobAppGenerator_theme'
    },
    
    DOCX_COLORS: {
        PRIMARY: '2c3e50',
        SECONDARY: '7f8c8d',
        LIGHT_GRAY: 'bdc3c7'
    }
};
