const Generator = {
    resume: null,
    coverLetter: null,
    jobData: null,
    options: null,
    
    init() {
        document.getElementById('generateResumeBtn').addEventListener('click', () => this.generate('resume'));
        document.getElementById('generateCoverLetterBtn').addEventListener('click', () => this.generate('coverLetter'));
        document.getElementById('generateBothBtn').addEventListener('click', () => this.generate('both'));
        document.getElementById('downloadResume').addEventListener('click', () => this.downloadResume());
        document.getElementById('downloadCover').addEventListener('click', () => this.downloadCoverLetter());
        
        this.initSectionOrder();
    },
    
    initSectionOrder() {
        const container = document.getElementById('sectionOrder');
        
        // Move buttons
        container.querySelectorAll('.move-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = btn.closest('.section-order-item');
                const dir = btn.dataset.dir;
                if (dir === 'up' && item.previousElementSibling) {
                    item.parentNode.insertBefore(item, item.previousElementSibling);
                } else if (dir === 'down' && item.nextElementSibling) {
                    item.parentNode.insertBefore(item.nextElementSibling, item);
                }
            });
        });
        
        // Drag and drop
        let draggedItem = null;
        
        container.querySelectorAll('.section-order-item').forEach(item => {
            item.setAttribute('draggable', true);
            
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                container.querySelectorAll('.section-order-item').forEach(i => i.classList.remove('drag-over'));
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (item !== draggedItem) {
                    item.classList.add('drag-over');
                }
            });
            
            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                if (item !== draggedItem) {
                    const items = [...container.querySelectorAll('.section-order-item')];
                    const draggedIdx = items.indexOf(draggedItem);
                    const targetIdx = items.indexOf(item);
                    if (draggedIdx < targetIdx) {
                        item.parentNode.insertBefore(draggedItem, item.nextSibling);
                    } else {
                        item.parentNode.insertBefore(draggedItem, item);
                    }
                }
            });
        });
    },
    
    getOptions() {
        // Get section order and inclusion
        const sectionItems = document.querySelectorAll('#sectionOrder .section-order-item');
        const sections = [];
        sectionItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                sections.push(item.dataset.section);
            }
        });
        
        return {
            metrics: document.getElementById('optMetrics').checked,
            summary: document.getElementById('optSummary').checked,
            boldKeywords: document.getElementById('optBoldKeywords').checked,
            links: document.getElementById('optLinks').checked,
            coursework: document.getElementById('optCoursework').checked,
            keywords: document.getElementById('optKeywords').checked,
            sections: sections
        };
    },
    
    async generate(type) {
        if (!Storage.hasMinimumData()) return alert('Add name, email, and at least one experience or project.');
        if (!Storage.getApiKey()) { Modals.open('settingsModal'); return; }
        
        const jobData = {
            jobTitle: document.getElementById('jobTitle').value.trim(),
            companyName: document.getElementById('companyName').value.trim(),
            jobDescription: document.getElementById('jobDescription').value.trim()
        };
        
        if (!jobData.jobTitle || !jobData.companyName || !jobData.jobDescription) {
            return alert('Fill in job title, company, and description.');
        }
        
        this.jobData = jobData;
        this.options = this.getOptions();
        this.showLoading(type);
        
        try {
            const profile = Storage.getAllProfileData();
            const result = await API.generate(profile, jobData, this.options, type);
            
            if (result.resume) this.resume = result.resume;
            if (result.coverLetter) {
                this.coverLetter = result.coverLetter;
                this.coverLetter.companyName = jobData.companyName;
            }
            
            this.showDownloads(type);
        } catch (e) {
            this.showError(e.message);
        }
    },
    
    showLoading(type) {
        document.getElementById('outputSection').style.display = 'block';
        document.getElementById('loadingSpinner').style.display = 'block';
        document.getElementById('loadingText').textContent = 'Generating...';
        document.getElementById('downloadButtons').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'none';
        this.setButtonsDisabled(true);
    },
    
    showDownloads(type) {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('downloadButtons').style.display = 'flex';
        document.getElementById('downloadResume').style.display = (type === 'resume' || type === 'both') ? 'block' : 'none';
        document.getElementById('downloadCover').style.display = (type === 'coverLetter' || type === 'both') ? 'block' : 'none';
        this.setButtonsDisabled(false);
    },
    
    showError(msg) {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorMessage').textContent = msg;
        this.setButtonsDisabled(false);
    },
    
    setButtonsDisabled(disabled) {
        ['generateResumeBtn', 'generateCoverLetterBtn', 'generateBothBtn'].forEach(id => {
            document.getElementById(id).disabled = disabled;
        });
    },
    
    downloadResume() {
        if (!this.resume) return alert('No resume generated.');
        const p = Storage.getPersonalInfo();
        const doc = PDFGenerator.createResume(p, this.resume, this.options);
        PDFGenerator.download(doc, `Resume_${Utils.sanitizeFilename(p.fullName)}_${Utils.sanitizeFilename(this.jobData.companyName)}.pdf`);
    },
    
    downloadCoverLetter() {
        if (!this.coverLetter) return alert('No cover letter generated.');
        const p = Storage.getPersonalInfo();
        const doc = PDFGenerator.createCoverLetter(p, this.coverLetter);
        PDFGenerator.download(doc, `CoverLetter_${Utils.sanitizeFilename(p.fullName)}_${Utils.sanitizeFilename(this.jobData.companyName)}.pdf`);
    }
};
