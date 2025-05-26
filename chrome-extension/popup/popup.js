// LinkedIn Auto Job Applier - Popup Script

class PopupController {
    constructor() {
        this.elements = {};
        this.status = 'offline';
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.loadInitialData();
    }

    bindElements() {
        this.elements = {
            statusDot: document.getElementById('statusDot'),
            statusText: document.getElementById('statusText'),
            statusDetails: document.getElementById('statusDetails'),
            appliedCount: document.getElementById('appliedCount'),
            successRate: document.getElementById('successRate'),
            quickApplyBtn: document.getElementById('quickApplyBtn'),
            viewHistoryBtn: document.getElementById('viewHistoryBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            autoSubmit: document.getElementById('autoSubmit'),
            useAI: document.getElementById('useAI'),
            helpLink: document.getElementById('helpLink'),
            feedbackLink: document.getElementById('feedbackLink')
        };
    }

    bindEvents() {
        this.elements.quickApplyBtn.addEventListener('click', () => this.handleQuickApply());
        this.elements.viewHistoryBtn.addEventListener('click', () => this.openHistoryPage());
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.autoSubmit.addEventListener('change', (e) => this.updateSetting('autoSubmit', e.target.checked));
        this.elements.useAI.addEventListener('change', (e) => this.updateSetting('useAI', e.target.checked));
        this.elements.helpLink.addEventListener('click', (e) => this.openHelp(e));
        this.elements.feedbackLink.addEventListener('click', (e) => this.openFeedback(e));
    }

    async loadInitialData() {
        try {
            // Check if we're on a LinkedIn job page
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const isJobPage = tab.url && tab.url.includes('linkedin.com/jobs/view/');

            this.elements.quickApplyBtn.disabled = !isJobPage;
            if (!isJobPage) {
                this.elements.quickApplyBtn.textContent = 'Navigate to a LinkedIn job page';
            }

            // Load status and stats
            await this.updateStatus();
            await this.loadStats();
            await this.loadSettings();

        } catch (error) {
            console.error('Error loading initial data:', error);
            this.updateStatusDisplay('offline', 'Error loading data');
        }
    }

    async updateStatus() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getStatus' });

            if (response.success) {
                this.status = response.data.status || 'online';
                this.updateStatusDisplay(this.status, response.data.message || 'Backend connected');
            } else {
                this.status = 'offline';
                this.updateStatusDisplay('offline', 'Backend not available');
            }
        } catch (error) {
            this.status = 'offline';
            this.updateStatusDisplay('offline', 'Connection failed');
        }
    }

    updateStatusDisplay(status, message) {
        this.elements.statusDot.className = `status-dot ${status}`;
        this.elements.statusText.textContent = this.getStatusText(status);
        this.elements.statusDetails.textContent = message;
    }

    getStatusText(status) {
        switch (status) {
            case 'online': return 'Ready to apply';
            case 'processing': return 'Processing application';
            case 'offline': return 'Backend offline';
            default: return 'Unknown status';
        }
    }

    async loadStats() {
        try {
            // For now, show placeholder data
            // In a real implementation, this would fetch from the backend
            this.elements.appliedCount.textContent = '0';
            this.elements.successRate.textContent = '-%';

            // TODO: Implement actual stats fetching
            // const response = await chrome.runtime.sendMessage({ action: 'getStats' });
            // if (response.success) {
            //   this.elements.appliedCount.textContent = response.data.appliedToday || '0';
            //   this.elements.successRate.textContent = response.data.successRate || '-%';
            // }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadSettings() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getConfig' });

            if (response.success) {
                const config = response.data;
                this.elements.autoSubmit.checked = config.autoSubmit || false;
                this.elements.useAI.checked = config.useAI || false;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async handleQuickApply() {
        try {
            this.elements.quickApplyBtn.disabled = true;
            this.elements.quickApplyBtn.textContent = 'Processing...';

            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.url.includes('linkedin.com/jobs/view/')) {
                throw new Error('Please navigate to a LinkedIn job page first');
            }

            // Send apply message to content script
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'triggerApply' });

            if (response && response.success) {
                this.showSuccess('Application process started!');
                this.updateStatusDisplay('processing', 'Applying to job...');
            } else {
                throw new Error(response?.error || 'Failed to start application');
            }

        } catch (error) {
            console.error('Quick apply error:', error);
            this.showError(error.message);
        } finally {
            setTimeout(() => {
                this.elements.quickApplyBtn.disabled = false;
                this.elements.quickApplyBtn.textContent = 'Quick Apply Current Job';
            }, 2000);
        }
    }

    async updateSetting(key, value) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'updateConfig',
                config: { [key]: value }
            });

            if (!response.success) {
                console.error('Failed to update setting:', response.error);
            }
        } catch (error) {
            console.error('Error updating setting:', error);
        }
    }

    openHistoryPage() {
        chrome.tabs.create({ url: 'http://localhost:5000' });
    }

    openSettings() {
        chrome.runtime.openOptionsPage();
    }

    openHelp(e) {
        e.preventDefault();
        chrome.tabs.create({
            url: 'https://github.com/GodsScion/Auto_job_applier_linkedIn#readme'
        });
    }

    openFeedback(e) {
        e.preventDefault();
        chrome.tabs.create({
            url: 'https://github.com/GodsScion/Auto_job_applier_linkedIn/discussions'
        });
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `popup-notification ${type}`;
        notification.textContent = message;

        // Add styles
        notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      padding: 12px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      text-align: center;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      animation: slideDown 0.3s ease-out;
    `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style); 