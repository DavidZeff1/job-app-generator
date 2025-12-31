const Profile = {
    init() {
        document.getElementById('editProfileBtn').addEventListener('click', () => this.toggleSections());
        document.getElementById('closeProfileBtn').addEventListener('click', () => this.toggleSections());
        
        // Accordions
        document.querySelectorAll('.accordion-header').forEach(h => {
            h.addEventListener('click', () => h.closest('.accordion').classList.toggle('open'));
        });
        
        // Auto-save
        const debounced = Utils.debounce(() => this.savePersonalInfo(), 500);
        document.getElementById('personalForm').addEventListener('input', debounced);
        document.getElementById('skillsForm').addEventListener('input', Utils.debounce(() => this.saveSkills(), 500));
        
        // Entry modals
        this.initEducationModal();
        this.initExperienceModal();
        this.initProjectModal();
        
        this.loadAll();
        this.checkApiKey();
    },
    
    checkApiKey() {
        const hasKey = !!Storage.getApiKey();
        document.getElementById('apiKeyWarning').style.display = hasKey ? 'none' : 'block';
        document.getElementById('apiKey').value = Storage.getApiKey();
    },
    
    toggleSections() {
        const el = document.getElementById('profileSections');
        const hidden = el.style.display === 'none';
        el.style.display = hidden ? 'block' : 'none';
        document.getElementById('editProfileBtn').textContent = hidden ? 'Close Profile' : 'Edit Profile';
    },
    
    loadAll() {
        this.loadPersonalInfo();
        this.loadSkills();
        this.loadEducation();
        this.loadExperience();
        this.loadProjects();
        this.updateSummary();
    },
    
    loadPersonalInfo() {
        const info = Storage.getPersonalInfo();
        ['fullName', 'email', 'phone', 'location', 'linkedIn', 'github', 'portfolio'].forEach(k => {
            document.getElementById(k).value = info[k] || '';
        });
    },
    
    savePersonalInfo() {
        const info = {};
        ['fullName', 'email', 'phone', 'location', 'linkedIn', 'github', 'portfolio'].forEach(k => {
            info[k] = document.getElementById(k).value.trim();
        });
        Storage.setPersonalInfo(info);
        this.updateSummary();
    },
    
    loadSkills() {
        const s = Storage.getSkills();
        document.getElementById('technicalSkills').value = s.technical.join(', ');
        document.getElementById('tools').value = s.tools.join(', ');
        document.getElementById('softSkills').value = s.soft.join(', ');
        document.getElementById('certifications').value = s.certifications.join(', ');
        document.getElementById('spokenLanguages').value = s.languages.join(', ');
    },
    
    saveSkills() {
        Storage.setSkills({
            technical: Utils.parseList(document.getElementById('technicalSkills').value),
            tools: Utils.parseList(document.getElementById('tools').value),
            soft: Utils.parseList(document.getElementById('softSkills').value),
            certifications: Utils.parseList(document.getElementById('certifications').value),
            languages: Utils.parseList(document.getElementById('spokenLanguages').value)
        });
        this.updateSummary();
    },
    
    updateSummary() {
        const p = Storage.getPersonalInfo();
        const c = Storage.getProfileCounts();
        document.getElementById('summaryName').textContent = p.fullName || 'No name set';
        document.getElementById('summaryContact').textContent = [p.email, p.phone].filter(Boolean).join(' | ') || 'Add contact info';
        document.getElementById('summaryCounts').innerHTML = `
            <span>📚 ${c.education} Education</span>
            <span>💼 ${c.experience} Experience</span>
            <span>🛠️ ${c.projects} Projects</span>
            <span>⚡ ${c.skills} Skills</span>`;
    },
    
    // Education
    initEducationModal() {
        document.getElementById('addEducationBtn').addEventListener('click', () => this.openEducationModal());
        document.getElementById('closeEducationBtn').addEventListener('click', () => Modals.close('educationModal'));
        document.getElementById('cancelEducationBtn').addEventListener('click', () => Modals.close('educationModal'));
        document.getElementById('educationForm').addEventListener('submit', e => this.saveEducation(e));
    },
    
    loadEducation() {
        const container = document.getElementById('educationList');
        container.innerHTML = '';
        Storage.getEducation().forEach(e => container.appendChild(this.createEntryItem(e, 'education', `${e.degree} in ${e.field}`, e.institution, `${e.startDate || ''} - ${e.endDate || ''}`)));
    },
    
    openEducationModal(data = null) {
        document.getElementById('educationModalTitle').textContent = data ? 'Edit Education' : 'Add Education';
        document.getElementById('educationId').value = data?.id || '';
        ['eduInstitution', 'eduDegree', 'eduField', 'eduGpa', 'eduStartDate', 'eduEndDate', 'eduHonors', 'eduNotes'].forEach(id => {
            const key = id.replace('edu', '').toLowerCase();
            document.getElementById(id).value = data?.[key] || '';
        });
        document.getElementById('eduCoursework').value = (data?.coursework || []).join(', ');
        Modals.open('educationModal');
    },
    
    saveEducation(e) {
        e.preventDefault();
        const id = document.getElementById('educationId').value;
        const entry = {
            institution: document.getElementById('eduInstitution').value.trim(),
            degree: document.getElementById('eduDegree').value.trim(),
            field: document.getElementById('eduField').value.trim(),
            gpa: document.getElementById('eduGpa').value.trim(),
            startDate: document.getElementById('eduStartDate').value.trim(),
            endDate: document.getElementById('eduEndDate').value.trim(),
            coursework: Utils.parseList(document.getElementById('eduCoursework').value),
            honors: document.getElementById('eduHonors').value.trim(),
            notes: document.getElementById('eduNotes').value.trim()
        };
        id ? Storage.updateEducation(id, entry) : Storage.addEducation(entry);
        Modals.close('educationModal');
        this.loadEducation();
        this.updateSummary();
    },
    
    // Experience
    initExperienceModal() {
        document.getElementById('addExperienceBtn').addEventListener('click', () => this.openExperienceModal());
        document.getElementById('closeExperienceBtn').addEventListener('click', () => Modals.close('experienceModal'));
        document.getElementById('cancelExperienceBtn').addEventListener('click', () => Modals.close('experienceModal'));
        document.getElementById('experienceForm').addEventListener('submit', e => this.saveExperience(e));
    },
    
    loadExperience() {
        const container = document.getElementById('experienceList');
        container.innerHTML = '';
        Storage.getExperience().forEach(e => container.appendChild(this.createEntryItem(e, 'experience', e.title, `${e.company}${e.location ? ', ' + e.location : ''}`, `${e.startDate || ''} - ${e.endDate || ''}`)));
    },
    
    openExperienceModal(data = null) {
        document.getElementById('experienceModalTitle').textContent = data ? 'Edit Experience' : 'Add Experience';
        document.getElementById('experienceId').value = data?.id || '';
        document.getElementById('expTitle').value = data?.title || '';
        document.getElementById('expCompany').value = data?.company || '';
        document.getElementById('expLocation').value = data?.location || '';
        document.getElementById('expStartDate').value = data?.startDate || '';
        document.getElementById('expEndDate').value = data?.endDate || '';
        document.getElementById('expDescription').value = data?.description || '';
        document.getElementById('expAchievements').value = (data?.achievements || []).join('\n');
        document.getElementById('expTechnologies').value = (data?.technologies || []).join(', ');
        document.getElementById('expResults').value = (data?.quantifiableResults || []).join(', ');
        Modals.open('experienceModal');
    },
    
    saveExperience(e) {
        e.preventDefault();
        const id = document.getElementById('experienceId').value;
        const entry = {
            title: document.getElementById('expTitle').value.trim(),
            company: document.getElementById('expCompany').value.trim(),
            location: document.getElementById('expLocation').value.trim(),
            startDate: document.getElementById('expStartDate').value.trim(),
            endDate: document.getElementById('expEndDate').value.trim(),
            description: document.getElementById('expDescription').value.trim(),
            achievements: Utils.parseLines(document.getElementById('expAchievements').value),
            technologies: Utils.parseList(document.getElementById('expTechnologies').value),
            quantifiableResults: Utils.parseList(document.getElementById('expResults').value)
        };
        id ? Storage.updateExperience(id, entry) : Storage.addExperience(entry);
        Modals.close('experienceModal');
        this.loadExperience();
        this.updateSummary();
    },
    
    // Projects
    initProjectModal() {
        document.getElementById('addProjectBtn').addEventListener('click', () => this.openProjectModal());
        document.getElementById('closeProjectBtn').addEventListener('click', () => Modals.close('projectModal'));
        document.getElementById('cancelProjectBtn').addEventListener('click', () => Modals.close('projectModal'));
        document.getElementById('projectForm').addEventListener('submit', e => this.saveProject(e));
    },
    
    loadProjects() {
        const container = document.getElementById('projectsList');
        container.innerHTML = '';
        Storage.getProjects().forEach(p => container.appendChild(this.createEntryItem(p, 'project', p.name, p.shortDescription || '', (p.technologies || []).slice(0, 4).join(', '))));
    },
    
    openProjectModal(data = null) {
        document.getElementById('projectModalTitle').textContent = data ? 'Edit Project' : 'Add Project';
        document.getElementById('projectId').value = data?.id || '';
        document.getElementById('projName').value = data?.name || '';
        document.getElementById('projDate').value = data?.date || '';
        document.getElementById('projShortDesc').value = data?.shortDescription || '';
        document.getElementById('projFullDesc').value = data?.fullDescription || '';
        document.getElementById('projTechnologies').value = (data?.technologies || []).join(', ');
        document.getElementById('projRole').value = data?.role || '';
        document.getElementById('projLink').value = data?.link || '';
        document.getElementById('projOutcomes').value = data?.outcomes || '';
        Modals.open('projectModal');
    },
    
    saveProject(e) {
        e.preventDefault();
        const id = document.getElementById('projectId').value;
        const entry = {
            name: document.getElementById('projName').value.trim(),
            date: document.getElementById('projDate').value.trim(),
            shortDescription: document.getElementById('projShortDesc').value.trim(),
            fullDescription: document.getElementById('projFullDesc').value.trim(),
            technologies: Utils.parseList(document.getElementById('projTechnologies').value),
            role: document.getElementById('projRole').value.trim(),
            link: document.getElementById('projLink').value.trim(),
            outcomes: document.getElementById('projOutcomes').value.trim()
        };
        id ? Storage.updateProject(id, entry) : Storage.addProject(entry);
        Modals.close('projectModal');
        this.loadProjects();
        this.updateSummary();
    },
    
    // Helper
    createEntryItem(data, type, title, subtitle, dates) {
        const div = document.createElement('div');
        div.className = 'entry-item';
        div.innerHTML = `<div class="entry-item-header"><div>
            <div class="entry-item-title">${title}</div>
            <div class="entry-item-subtitle">${subtitle}</div>
            <div class="entry-item-dates">${dates}</div>
        </div><div class="entry-item-actions">
            <button class="btn-edit">Edit</button>
            <button class="btn-danger">Delete</button>
        </div></div>`;
        
        div.querySelector('.btn-edit').addEventListener('click', () => {
            if (type === 'education') this.openEducationModal(data);
            else if (type === 'experience') this.openExperienceModal(data);
            else this.openProjectModal(data);
        });
        
        div.querySelector('.btn-danger').addEventListener('click', () => {
            if (!confirm('Delete this entry?')) return;
            if (type === 'education') { Storage.deleteEducation(data.id); this.loadEducation(); }
            else if (type === 'experience') { Storage.deleteExperience(data.id); this.loadExperience(); }
            else { Storage.deleteProject(data.id); this.loadProjects(); }
            this.updateSummary();
        });
        
        return div;
    }
};
