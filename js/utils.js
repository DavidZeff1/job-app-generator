const Utils = {
    generateId() {
        return crypto.randomUUID();
    },
    
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },
    
    parseList(str) {
        return str.split(',').map(s => s.trim()).filter(s => s);
    },
    
    parseLines(str) {
        return str.split('\n').map(s => s.trim()).filter(s => s);
    },
    
    shortenUrl(url) {
        if (!url) return '';
        return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    },
    
    formatDate() {
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    sanitizeFilename(str) {
        return str.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    }
};
