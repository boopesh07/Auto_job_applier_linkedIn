// LinkedIn Auto Job Applier - Background Service Worker

class BackgroundService {
    constructor() {
        this.backendUrl = 'http://localhost:5000';
        this.setupMessageListener();
        this.setupInstallListener();
    }

    setupInstallListener() {
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                console.log('LinkedIn Auto Job Applier installed');
                this.openOptionsPage();
            }
        });
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep the message channel open for async response
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'applyToJob':
                    await this.handleJobApplication(request.jobInfo, sendResponse);
                    break;
                case 'getStatus':
                    await this.getApplicationStatus(sendResponse);
                    break;
                case 'getConfig':
                    await this.getConfiguration(sendResponse);
                    break;
                case 'updateConfig':
                    await this.updateConfiguration(request.config, sendResponse);
                    break;
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Background service error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async handleJobApplication(jobInfo, sendResponse) {
        try {
            console.log('Processing job application for:', jobInfo);

            // Check if backend is running
            const isBackendRunning = await this.checkBackendStatus();
            if (!isBackendRunning) {
                sendResponse({
                    success: false,
                    error: 'Backend service is not running. Please start the Python backend.'
                });
                return;
            }

            // Send job application request to backend
            const response = await fetch(`${this.backendUrl}/api/apply-job`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobInfo)
            });

            if (response.ok) {
                const result = await response.json();
                sendResponse({ success: true, data: result });

                // Show notification
                this.showNotification('Job Application Started',
                    `Started applying to ${jobInfo.title} at ${jobInfo.company}`);
            } else {
                const error = await response.text();
                sendResponse({ success: false, error: error });
            }

        } catch (error) {
            console.error('Job application error:', error);
            sendResponse({
                success: false,
                error: 'Failed to connect to backend service. Make sure the Python backend is running.'
            });
        }
    }

    async checkBackendStatus() {
        try {
            const response = await fetch(`${this.backendUrl}/api/status`, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.log('Backend not available:', error);
            return false;
        }
    }

    async getApplicationStatus(sendResponse) {
        try {
            const response = await fetch(`${this.backendUrl}/api/status`);
            if (response.ok) {
                const status = await response.json();
                sendResponse({ success: true, data: status });
            } else {
                sendResponse({ success: false, error: 'Failed to get status' });
            }
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }

    async getConfiguration(sendResponse) {
        try {
            // First try to get from storage
            const stored = await chrome.storage.sync.get(['config']);
            if (stored.config) {
                sendResponse({ success: true, data: stored.config });
                return;
            }

            // If not in storage, try to get from backend
            const response = await fetch(`${this.backendUrl}/api/config`);
            if (response.ok) {
                const config = await response.json();
                // Store in extension storage
                await chrome.storage.sync.set({ config: config });
                sendResponse({ success: true, data: config });
            } else {
                sendResponse({ success: false, error: 'Failed to get configuration' });
            }
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }

    async updateConfiguration(config, sendResponse) {
        try {
            // Save to extension storage
            await chrome.storage.sync.set({ config: config });

            // Send to backend
            const response = await fetch(`${this.backendUrl}/api/config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false, error: 'Failed to update backend configuration' });
            }
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }

    showNotification(title, message) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icons/icon48.png',
            title: title,
            message: message
        });
    }

    openOptionsPage() {
        chrome.runtime.openOptionsPage();
    }
}

// Initialize the background service
new BackgroundService(); 