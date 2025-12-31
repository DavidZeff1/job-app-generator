const Modals = {
    init() {
        // Close on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', e => {
                if (e.target === modal) this.close(modal.id);
            });
        });
        
        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.open('settingsModal'));
        document.getElementById('addApiKeyBtn')?.addEventListener('click', () => this.open('settingsModal'));
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.close('settingsModal'));
        document.getElementById('saveApiKeyBtn').addEventListener('click', () => this.saveApiKey());
        
        // Import
        document.getElementById('importResumeBtn').addEventListener('click', () => this.open('importModal'));
        document.getElementById('closeImportBtn').addEventListener('click', () => this.close('importModal'));
        document.getElementById('cancelImportBtn').addEventListener('click', () => this.close('importModal'));
        document.getElementById('parseResumeBtn').addEventListener('click', () => this.parseResume());
        
        // Toggle API key visibility
        document.getElementById('toggleApiKey')?.addEventListener('click', () => this.toggleApiKeyVisibility());
    },
    
    open(id) { document.getElementById(id).classList.add('open'); },
    close(id) { document.getElementById(id).classList.remove('open'); },
    
    saveApiKey() {
        const key = document.getElementById('apiKey').value.trim();
        if (key && !key.startsWith('sk-ant-')) {
            alert('Invalid API key format. It should start with "sk-ant-"');
            return;
        }
        Storage.setApiKey(key);
        Profile.checkApiKey();
        this.close('settingsModal');
    },
    
    toggleApiKeyVisibility() {
        const input = document.getElementById('apiKey');
        const btn = document.getElementById('toggleApiKey');
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🙈';
        } else {
            input.type = 'password';
            btn.textContent = '👁️';
        }
    },
    
    async parseResume() {
        const text = document.getElementById('resumeText').value.trim();
        if (!text) return alert('Please paste your resume text.');
        if (!Storage.getApiKey()) {
            this.close('importModal');
            return this.open('settingsModal');
        }
        
        document.getElementById('importSpinner').style.display = 'block';
        document.getElementById('parseResumeBtn').disabled = true;
        
        try {
            const data = await API.parseResume(text);
            Storage.importResumeData(data);
            Profile.loadAll();
            this.close('importModal');
            document.getElementById('resumeText').value = '';
            alert('Resume imported! Check your profile.');
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            document.getElementById('importSpinner').style.display = 'none';
            document.getElementById('parseResumeBtn').disabled = false;
        }
    }
};
