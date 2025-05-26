// LinkedIn Auto Job Applier - Options Page Script

class OptionsController {
    constructor() {
        this.config = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadConfiguration();
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Form elements
        document.getElementById('resumeFile').addEventListener('change', (e) => this.handleResumeUpload(e));

        // Save and cancel buttons
        document.getElementById('saveBtn').addEventListener('click', () => this.saveConfiguration());
        document.getElementById('cancelBtn').addEventListener('click', () => this.resetForm());

        // Data management buttons
        document.getElementById('exportConfig').addEventListener('click', () => this.exportConfiguration());
        document.getElementById('importConfig').addEventListener('click', () => this.importConfiguration());
        document.getElementById('resetConfig').addEventListener('click', () => this.resetToDefaults());

        // Auto-save on input changes
        this.setupAutoSave();
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    async loadConfiguration() {
        try {
            // Load from Chrome storage
            const result = await chrome.storage.sync.get(['config']);
            this.config = result.config || this.getDefaultConfig();

            this.populateForm();
            this.showNotification('Configuration loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading configuration:', error);
            this.config = this.getDefaultConfig();
            this.populateForm();
            this.showNotification('Using default configuration', 'error');
        }
    }

    getDefaultConfig() {
        return {
            // Personal Info
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',

            // Job Preferences
            jobTitles: '',
            location: '',
            experienceLevel: '',
            salaryRange: '',
            easyApplyOnly: true,
            remoteJobs: false,
            requireVisa: false,

            // AI Settings
            enableAI: false,
            autoSubmit: false,
            aiProvider: 'openai',
            apiKey: '',

            // Advanced
            backendUrl: 'http://localhost:5000',
            clickDelay: 1,
            debugMode: false
        };
    }

    populateForm() {
        // Personal Info
        document.getElementById('firstName').value = this.config.firstName || '';
        document.getElementById('lastName').value = this.config.lastName || '';
        document.getElementById('email').value = this.config.email || '';
        document.getElementById('phone').value = this.config.phone || '';
        document.getElementById('address').value = this.config.address || '';

        // Job Preferences
        document.getElementById('jobTitles').value = this.config.jobTitles || '';
        document.getElementById('location').value = this.config.location || '';
        document.getElementById('experienceLevel').value = this.config.experienceLevel || '';
        document.getElementById('salaryRange').value = this.config.salaryRange || '';
        document.getElementById('easyApplyOnly').checked = this.config.easyApplyOnly || false;
        document.getElementById('remoteJobs').checked = this.config.remoteJobs || false;
        document.getElementById('requireVisa').checked = this.config.requireVisa || false;

        // AI Settings
        document.getElementById('enableAI').checked = this.config.enableAI || false;
        document.getElementById('autoSubmit').checked = this.config.autoSubmit || false;
        document.getElementById('aiProvider').value = this.config.aiProvider || 'openai';
        document.getElementById('apiKey').value = this.config.apiKey || '';

        // Advanced
        document.getElementById('backendUrl').value = this.config.backendUrl || 'http://localhost:5000';
        document.getElementById('clickDelay').value = this.config.clickDelay || 1;
        document.getElementById('debugMode').checked = this.config.debugMode || false;
    }

    collectFormData() {
        return {
            // Personal Info
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),

            // Job Preferences
            jobTitles: document.getElementById('jobTitles').value.trim(),
            location: document.getElementById('location').value.trim(),
            experienceLevel: document.getElementById('experienceLevel').value,
            salaryRange: document.getElementById('salaryRange').value.trim(),
            easyApplyOnly: document.getElementById('easyApplyOnly').checked,
            remoteJobs: document.getElementById('remoteJobs').checked,
            requireVisa: document.getElementById('requireVisa').checked,

            // AI Settings
            enableAI: document.getElementById('enableAI').checked,
            autoSubmit: document.getElementById('autoSubmit').checked,
            aiProvider: document.getElementById('aiProvider').value,
            apiKey: document.getElementById('apiKey').value.trim(),

            // Advanced
            backendUrl: document.getElementById('backendUrl').value.trim(),
            clickDelay: parseFloat(document.getElementById('clickDelay').value) || 1,
            debugMode: document.getElementById('debugMode').checked
        };
    }

    async saveConfiguration() {
        try {
            const formData = this.collectFormData();

            // Validate required fields
            if (!formData.firstName || !formData.lastName || !formData.email) {
                this.showNotification('Please fill in all required personal information fields', 'error');
                this.switchTab('personal');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                this.showNotification('Please enter a valid email address', 'error');
                this.switchTab('personal');
                return;
            }

            // Save to Chrome storage
            await chrome.storage.sync.set({ config: formData });
            this.config = formData;

            // Send to background script to sync with backend
            chrome.runtime.sendMessage({
                action: 'updateConfig',
                config: formData
            });

            this.showNotification('Configuration saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving configuration:', error);
            this.showNotification('Failed to save configuration', 'error');
        }
    }

    resetForm() {
        this.populateForm();
        this.showNotification('Changes discarded', 'success');
    }

    async resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
            this.config = this.getDefaultConfig();
            this.populateForm();
            await this.saveConfiguration();
            this.showNotification('Settings reset to defaults', 'success');
        }
    }

    exportConfiguration() {
        const dataStr = JSON.stringify(this.config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'linkedin-auto-applier-config.json';
        link.click();

        this.showNotification('Configuration exported successfully', 'success');
    }

    importConfiguration() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const importedConfig = JSON.parse(text);

                // Validate imported config
                if (this.validateConfig(importedConfig)) {
                    this.config = { ...this.getDefaultConfig(), ...importedConfig };
                    this.populateForm();
                    await this.saveConfiguration();
                    this.showNotification('Configuration imported successfully', 'success');
                } else {
                    this.showNotification('Invalid configuration file', 'error');
                }
            } catch (error) {
                console.error('Error importing configuration:', error);
                this.showNotification('Failed to import configuration', 'error');
            }
        };

        input.click();
    }

    validateConfig(config) {
        // Basic validation - check if it's an object and has expected properties
        return typeof config === 'object' && config !== null;
    }

    handleResumeUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const statusElement = document.getElementById('resumeStatus');

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            statusElement.textContent = 'Please select a PDF or Word document';
            statusElement.style.color = '#ef4444';
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            statusElement.textContent = 'File size must be less than 5MB';
            statusElement.style.color = '#ef4444';
            return;
        }

        statusElement.textContent = `Uploaded: ${file.name}`;
        statusElement.style.color = '#10b981';

        // TODO: In a real implementation, you would upload this to the backend
        this.showNotification('Resume uploaded successfully', 'success');
    }

    setupAutoSave() {
        // Auto-save on input changes (debounced)
        let saveTimeout;
        const inputs = document.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    this.saveConfiguration();
                }, 2000); // Auto-save after 2 seconds of inactivity
            });
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300);
        }, 3000);
    }
}

// Initialize options controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new OptionsController();
}); 