// LinkedIn Auto Job Applier - Content Script
class LinkedInJobApplier {
    constructor() {
        this.isJobsPage = false;
        this.floatingPopup = null;
        this.init();
    }

    init() {
        console.log('LinkedIn Job Applier: Initializing on', window.location.href);
        this.detectPageType();
        this.setupObserver();

        // Initial injection after page load
        setTimeout(() => {
            if (this.isJobsPage) {
                this.injectFloatingPopup();
            }
        }, 3000);
    }

    detectPageType() {
        const url = window.location.href;

        // Check if we're on any LinkedIn jobs page
        this.isJobsPage = url.includes('/jobs');

        console.log('LinkedIn Job Applier: Page detection -', {
            isJobsPage: this.isJobsPage,
            url: url
        });
    }

    injectFloatingPopup() {
        // Remove existing popup if present
        if (this.floatingPopup) {
            this.floatingPopup.remove();
        }

        console.log('LinkedIn Job Applier: Injecting floating popup');

        // Create floating popup container
        this.floatingPopup = document.createElement('div');
        this.floatingPopup.className = 'linkedin-auto-applier-popup';
        this.floatingPopup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <div class="popup-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M13 3L4 14h7v7l9-11h-7V3z" fill="#0066cc"/>
                        </svg>
                        <span>Auto Job Applier</span>
                    </div>
                    <div class="header-controls"><div class="drag-handle" title="Drag to move"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg></div><button class="popup-minimize" title="Minimize">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M6 12h12" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
                <div class="popup-body">
                    <p class="popup-description">Automatically apply to jobs on this page using AI-powered form filling</p>
                    <div class="popup-stats">
                        <div class="stat-item">
                            <span class="stat-label">Status:</span>
                            <span class="stat-value" id="popup-status">Ready</span>
                        </div>
                    </div>
                    <button class="auto-apply-btn" id="auto-apply-button">
                        <div class="btn-content">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M13 3L4 14h7v7l9-11h-7V3z" fill="white"/>
                            </svg>
                            <span>Auto Apply Jobs</span>
                        </div>
                    </button>
                    <div class="popup-footer">
                        <small>Make sure you're logged into LinkedIn</small>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const autoApplyBtn = this.floatingPopup.querySelector('#auto-apply-button');
        const minimizeBtn = this.floatingPopup.querySelector('.popup-minimize');

        autoApplyBtn.addEventListener('click', () => this.handleAutoApplyClick());
        minimizeBtn.addEventListener('click', () => this.togglePopup());

        // Make popup draggable
        this.makeDraggable(this.floatingPopup);

        // Add to page
        document.body.appendChild(this.floatingPopup);

        // Add CSS styles for the popup
        this.addPopupStyles();

        console.log('LinkedIn Job Applier: Floating popup injected successfully');
    }

    addPopupStyles() {
        // Check if styles are already added
        if (document.getElementById('linkedin-auto-applier-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'linkedin-auto-applier-styles';
        style.textContent = `
            .linkedin-auto-applier-popup {
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                width: 320px !important;
                background: white !important;
                border: 1px solid #d0d7de !important;
                border-radius: 12px !important;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
                z-index: 10000 !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
                color: #1f2328 !important;
            }

            .linkedin-auto-applier-popup .stat-value.running {
                color: #0969da !important;
                font-weight: 600 !important;
            }

            .linkedin-auto-applier-popup .auto-apply-btn.stop {
                background: #d1242f !important;
            }

            .linkedin-auto-applier-popup .auto-apply-btn.stop:hover:not(:disabled) {
                background: #b91c2c !important;
            }

            .linkedin-auto-applier-popup .spinner {
                width: 16px !important;
                height: 16px !important;
                border: 2px solid transparent !important;
                border-top: 2px solid white !important;
                border-radius: 50% !important;
                animation: spin 1s linear infinite !important;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;

        document.head.appendChild(style);
    }

    makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = element.querySelector('.popup-header');

        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    togglePopup() {
        const popup = this.floatingPopup;
        const body = popup.querySelector('.popup-body');

        if (popup.classList.contains('minimized')) {
            popup.classList.remove('minimized');
            body.style.display = 'block';
        } else {
            popup.classList.add('minimized');
            body.style.display = 'none';
        }
    }

    async handleAutoApplyClick() {
        try {
            console.log('LinkedIn Job Applier: Auto apply button clicked');

            // Check current automation status first
            const statusResponse = await fetch('http://localhost:4000/api/automation-status', {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (statusResponse.ok) {
                const statusData = await statusResponse.json();

                if (statusData.running) {
                    // Stop the automation
                    await this.stopAutomation();
                } else {
                    // Start the automation
                    await this.startAutomation();
                }
            } else {
                // Assume not running, try to start
                await this.startAutomation();
            }

        } catch (error) {
            console.error('LinkedIn Job Applier Error:', error);
            this.setStatus('Error occurred', 'error');
            this.setButtonState('error');
            this.showNotification('An error occurred: ' + error.message, 'error');
        }
    }

    async startAutomation() {
        try {
            this.setStatus('Starting automation...', 'loading');
            this.setButtonState('loading');

            // Get current page URL and basic info
            const pageInfo = {
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };

            console.log('Page Info:', pageInfo);

            // Send request to backend to start automation
            const response = await this.triggerBackendAutomation(pageInfo);

            if (response && response.success) {
                this.setStatus('Automation running...', 'running');
                this.setButtonState('stop');
                this.showNotification('Job application automation has started!', 'success');

                // Start polling for status updates
                this.startStatusPolling();
            } else {
                this.setStatus('Failed to start automation', 'error');
                this.setButtonState('error');
                this.showNotification(response?.error || 'Failed to start automation process', 'error');
            }
        } catch (error) {
            console.error('Error starting automation:', error);
            this.setStatus('Error occurred', 'error');
            this.setButtonState('error');
            this.showNotification('Failed to start automation: ' + error.message, 'error');
        }
    }

    async stopAutomation() {
        try {
            this.setStatus('Stopping automation...', 'loading');
            this.setButtonState('loading');

            const response = await fetch('http://localhost:4000/api/stop-automation', {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Stop automation request successful:', result);

            if (result.success) {
                this.setStatus('Automation stopped', 'normal');
                this.setButtonState('normal');
                this.showNotification('Job application automation has been stopped!', 'success');
                this.stopStatusPolling();
            } else {
                this.setStatus('Failed to stop automation', 'error');
                this.setButtonState('error');
                this.showNotification(result.error || 'Failed to stop automation', 'error');
            }

        } catch (error) {
            console.error('Error stopping automation:', error);
            this.setStatus('Error occurred', 'error');
            this.setButtonState('error');
            this.showNotification('Failed to stop automation: ' + error.message, 'error');
        }
    }

    startStatusPolling() {
        // Poll every 3 seconds to check automation status
        this.statusPollingInterval = setInterval(async () => {
            try {
                const response = await fetch('http://localhost:4000/api/automation-status', {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (response.ok) {
                    const statusData = await response.json();

                    if (!statusData.running) {
                        // Automation has finished
                        this.setStatus('Automation completed', 'success');
                        this.setButtonState('success');
                        this.stopStatusPolling();

                        // Reset to normal state after a few seconds
                        setTimeout(() => {
                            this.resetButton();
                        }, 3000);
                    }
                }
            } catch (error) {
                console.error('Error polling status:', error);
            }
        }, 3000);
    }

    stopStatusPolling() {
        if (this.statusPollingInterval) {
            clearInterval(this.statusPollingInterval);
            this.statusPollingInterval = null;
        }
    }

    async triggerBackendAutomation(pageInfo) {
        try {
            // First test if CORS is working with a simple GET request
            console.log('Testing CORS connection...');
            const testResponse = await fetch('http://localhost:4000/api/test', {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!testResponse.ok) {
                console.log('CORS test failed:', testResponse.status);
            } else {
                const testData = await testResponse.json();
                console.log('CORS test successful:', testData);
            }

            // Now make the actual automation request
            console.log('Making automation request...');
            const response = await fetch('http://localhost:4000/api/start-automation', {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pageInfo)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Automation request successful:', result);
            return result;

        } catch (error) {
            console.error('Backend communication error:', error);
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Backend service is not running. Please start the Python backend first.');
            }
            throw error;
        }
    }

    setStatus(message, type = 'normal') {
        const statusElement = this.floatingPopup?.querySelector('#popup-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `stat-value ${type}`;
        }
    }

    setButtonState(state) {
        const button = this.floatingPopup?.querySelector('#auto-apply-button');
        const content = button?.querySelector('.btn-content');

        if (!button || !content) return;

        switch (state) {
            case 'loading':
                button.disabled = true;
                button.classList.add('loading');
                content.innerHTML = `
                    <div class="spinner"></div>
                    <span>Processing...</span>
                `;
                break;
            case 'stop':
                button.disabled = false;
                button.classList.remove('loading', 'success', 'error');
                button.classList.add('stop');
                content.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="6" y="6" width="12" height="12" fill="white"/>
                    </svg>
                    <span>Stop Applying</span>
                `;
                break;
            case 'success':
                button.classList.remove('loading', 'stop');
                button.classList.add('success');
                content.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" stroke-width="2"/>
                    </svg>
                    <span>Completed!</span>
                `;
                break;
            case 'error':
                button.classList.remove('loading', 'stop');
                button.classList.add('error');
                content.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" stroke-width="2"/>
                    </svg>
                    <span>Error</span>
                `;
                setTimeout(() => this.resetButton(), 5000);
                break;
            default: // normal
                this.resetButton();
                break;
        }
    }

    resetButton() {
        const button = this.floatingPopup?.querySelector('#auto-apply-button');
        const content = button?.querySelector('.btn-content');

        if (!button || !content) return;

        button.disabled = false;
        button.className = 'auto-apply-btn';
        content.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 3L4 14h7v7l9-11h-7V3z" fill="white"/>
            </svg>
            <span>Auto Apply Jobs</span>
        `;
        this.setStatus('Ready', 'normal');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `linkedin-applier-notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    setupObserver() {
        // Watch for URL changes (LinkedIn is a SPA)
        let currentUrl = window.location.href;

        const observer = new MutationObserver(() => {
            // Check for URL changes
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                console.log('LinkedIn Job Applier: URL changed to', currentUrl);

                const wasJobsPage = this.isJobsPage;
                this.detectPageType();

                // Show/hide popup based on page type
                if (this.isJobsPage && !wasJobsPage) {
                    setTimeout(() => this.injectFloatingPopup(), 1000);
                } else if (!this.isJobsPage && this.floatingPopup) {
                    this.cleanupPopup();
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also listen for history changes
        window.addEventListener('popstate', () => {
            setTimeout(() => {
                this.detectPageType();
                if (this.isJobsPage) {
                    this.injectFloatingPopup();
                } else if (this.floatingPopup) {
                    this.cleanupPopup();
                }
            }, 1000);
        });
    }

    cleanupPopup() {
        // Stop status polling
        this.stopStatusPolling();

        // Remove popup from DOM
        if (this.floatingPopup) {
            this.floatingPopup.remove();
            this.floatingPopup = null;
        }
    }
}

// Initialize when DOM is ready
function initializeExtension() {
    console.log('LinkedIn Job Applier: DOM ready, initializing...');
    new LinkedInJobApplier();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
} 