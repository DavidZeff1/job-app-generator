const Theme = {
    init() {
        const theme = Storage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
        this.updateIcon(theme);
        document.getElementById('themeToggle').addEventListener('click', () => this.toggle());
    },
    
    toggle() {
        const current = Storage.getTheme();
        const next = current === 'light' ? 'dark' : 'light';
        Storage.setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        this.updateIcon(next);
    },
    
    updateIcon(theme) {
        document.getElementById('themeToggle').textContent = theme === 'light' ? '🌙' : '☀️';
    }
};
