const Storage = {
    get(key) {
        const data = localStorage.getItem(key);
        try { return data ? JSON.parse(data) : null; }
        catch { return data; }
    },
    
    set(key, value) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    },
    
    // Theme
    getTheme() { return localStorage.getItem(Config.STORAGE_KEYS.THEME) || 'light'; },
    setTheme(theme) { localStorage.setItem(Config.STORAGE_KEYS.THEME, theme); },
    
    // API Key
    getApiKey() { return localStorage.getItem(Config.STORAGE_KEYS.API_KEY) || ''; },
    setApiKey(key) { localStorage.setItem(Config.STORAGE_KEYS.API_KEY, key); },
    
    // Personal Info
    getPersonalInfo() {
        return this.get(Config.STORAGE_KEYS.PERSONAL_INFO) || {
            fullName: '', email: '', phone: '', linkedIn: '', github: '', portfolio: '', location: ''
        };
    },
    setPersonalInfo(info) { this.set(Config.STORAGE_KEYS.PERSONAL_INFO, info); },
    
    // Education
    getEducation() { return this.get(Config.STORAGE_KEYS.EDUCATION) || []; },
    setEducation(data) { this.set(Config.STORAGE_KEYS.EDUCATION, data); },
    addEducation(entry) {
        const data = this.getEducation();
        entry.id = Utils.generateId();
        data.push(entry);
        this.setEducation(data);
        return entry;
    },
    updateEducation(id, entry) {
        const data = this.getEducation();
        const idx = data.findIndex(e => e.id === id);
        if (idx !== -1) { data[idx] = { ...entry, id }; this.setEducation(data); }
    },
    deleteEducation(id) {
        this.setEducation(this.getEducation().filter(e => e.id !== id));
    },
    
    // Experience
    getExperience() { return this.get(Config.STORAGE_KEYS.EXPERIENCE) || []; },
    setExperience(data) { this.set(Config.STORAGE_KEYS.EXPERIENCE, data); },
    addExperience(entry) {
        const data = this.getExperience();
        entry.id = Utils.generateId();
        data.push(entry);
        this.setExperience(data);
        return entry;
    },
    updateExperience(id, entry) {
        const data = this.getExperience();
        const idx = data.findIndex(e => e.id === id);
        if (idx !== -1) { data[idx] = { ...entry, id }; this.setExperience(data); }
    },
    deleteExperience(id) {
        this.setExperience(this.getExperience().filter(e => e.id !== id));
    },
    
    // Projects
    getProjects() { return this.get(Config.STORAGE_KEYS.PROJECTS) || []; },
    setProjects(data) { this.set(Config.STORAGE_KEYS.PROJECTS, data); },
    addProject(entry) {
        const data = this.getProjects();
        entry.id = Utils.generateId();
        data.push(entry);
        this.setProjects(data);
        return entry;
    },
    updateProject(id, entry) {
        const data = this.getProjects();
        const idx = data.findIndex(e => e.id === id);
        if (idx !== -1) { data[idx] = { ...entry, id }; this.setProjects(data); }
    },
    deleteProject(id) {
        this.setProjects(this.getProjects().filter(e => e.id !== id));
    },
    
    // Skills
    getSkills() {
        return this.get(Config.STORAGE_KEYS.SKILLS) || {
            technical: [], tools: [], soft: [], certifications: [], languages: []
        };
    },
    setSkills(data) { this.set(Config.STORAGE_KEYS.SKILLS, data); },
    
    // Helpers
    getAllProfileData() {
        return {
            personalInfo: this.getPersonalInfo(),
            education: this.getEducation(),
            experience: this.getExperience(),
            projects: this.getProjects(),
            skills: this.getSkills()
        };
    },
    
    hasMinimumData() {
        const p = this.getPersonalInfo();
        return p.fullName?.trim() && p.email?.trim() && 
               (this.getExperience().length > 0 || this.getProjects().length > 0);
    },
    
    getProfileCounts() {
        const skills = this.getSkills();
        const skillCount = Object.values(skills).flat().filter(s => s?.trim()).length;
        return {
            education: this.getEducation().length,
            experience: this.getExperience().length,
            projects: this.getProjects().length,
            skills: skillCount
        };
    },
    
    importResumeData(data) {
        if (data.personalInfo) {
            const current = this.getPersonalInfo();
            this.setPersonalInfo({ ...current, ...data.personalInfo });
        }
        data.education?.forEach(e => this.addEducation(e));
        data.experience?.forEach(e => this.addExperience(e));
        data.projects?.forEach(e => this.addProject(e));
        if (data.skills) {
            const current = this.getSkills();
            this.setSkills({
                technical: [...new Set([...current.technical, ...(data.skills.technical || [])])],
                tools: [...new Set([...current.tools, ...(data.skills.tools || [])])],
                soft: [...new Set([...current.soft, ...(data.skills.soft || [])])],
                certifications: [...new Set([...current.certifications, ...(data.skills.certifications || [])])],
                languages: [...new Set([...current.languages, ...(data.skills.languages || [])])]
            });
        }
    }
};
