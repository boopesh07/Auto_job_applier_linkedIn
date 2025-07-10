// LinkedIn Auto Job Applier - Background Service Worker
// This service worker handles extension lifecycle and communication

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
    console.log('LinkedIn Auto Job Applier extension installed/updated:', details.reason);

    if (details.reason === 'install') {
        console.log('Extension installed for the first time');
        // Set default settings
        chrome.storage.sync.set({
            autoApplyEnabled: false,
            pauseBeforeSubmit: true,
            debugMode: false
        });
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);

    switch (request.action) {
        case 'startAutomation':
            handleStartAutomation(request.data, sendResponse);
            return true; // Keep message channel open for async response

        case 'stopAutomation':
            handleStopAutomation(sendResponse);
            return true;

        case 'getStatus':
            handleGetStatus(sendResponse);
            return true;

        case 'logMessage':
            console.log('Content script log:', request.message);
            sendResponse({ success: true });
            break;

        default:
            console.warn('Unknown action:', request.action);
            sendResponse({ error: 'Unknown action' });
    }
});

// Handle starting automation
async function handleStartAutomation(data, sendResponse) {
    try {
        console.log('Starting automation with data:', data);

        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.url.includes('linkedin.com')) {
            sendResponse({
                success: false,
                error: 'Please navigate to LinkedIn jobs page first'
            });
            return;
        }

        // Send message to Flask backend to start automation
        try {
            const response = await fetch('http://localhost:5000/api/start-automation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: tab.url,
                    tabId: tab.id,
                    timestamp: new Date().toISOString()
                })
            });

            const result = await response.json();

            if (result.success) {
                // Store automation state
                await chrome.storage.local.set({
                    automationRunning: true,
                    automationStartTime: new Date().toISOString(),
                    processId: result.process_id
                });

                // Show notification
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'assets/icons/icon48.png',
                    title: 'LinkedIn Auto Job Applier',
                    message: 'Job application automation started successfully!'
                });

                sendResponse({ success: true, message: result.message });
            } else {
                sendResponse({ success: false, error: result.error });
            }
        } catch (fetchError) {
            console.error('Failed to communicate with backend:', fetchError);
            sendResponse({
                success: false,
                error: 'Failed to start automation. Make sure the Flask server is running on localhost:5000'
            });
        }

    } catch (error) {
        console.error('Error starting automation:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle stopping automation
async function handleStopAutomation(sendResponse) {
    try {
        // Send stop request to Flask backend
        const response = await fetch('http://localhost:5000/api/stop-automation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        // Clear automation state
        await chrome.storage.local.set({
            automationRunning: false,
            automationStartTime: null,
            processId: null
        });

        // Show notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icons/icon48.png',
            title: 'LinkedIn Auto Job Applier',
            message: 'Job application automation stopped'
        });

        sendResponse({ success: true, message: 'Automation stopped' });

    } catch (error) {
        console.error('Error stopping automation:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle status check
async function handleGetStatus(sendResponse) {
    try {
        const storage = await chrome.storage.local.get([
            'automationRunning',
            'automationStartTime',
            'processId'
        ]);

        // Also check with backend
        try {
            const response = await fetch('http://localhost:5000/api/automation-status');
            const backendStatus = await response.json();

            sendResponse({
                success: true,
                status: {
                    running: storage.automationRunning || false,
                    startTime: storage.automationStartTime,
                    processId: storage.processId,
                    backend: backendStatus
                }
            });
        } catch (fetchError) {
            sendResponse({
                success: true,
                status: {
                    running: storage.automationRunning || false,
                    startTime: storage.automationStartTime,
                    processId: storage.processId,
                    backend: { error: 'Backend unreachable' }
                }
            });
        }

    } catch (error) {
        console.error('Error getting status:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle tab updates - monitor LinkedIn navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('linkedin.com/jobs')) {
        console.log('LinkedIn jobs page loaded:', tab.url);

        // Inject content script if needed
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content/content.js']
        }).catch(err => {
            // Script might already be injected
            console.log('Content script injection skipped:', err.message);
        });
    }
});

// Keep service worker alive by setting up periodic tasks
chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
        console.log('Service worker keepalive ping');
    }
});

console.log('LinkedIn Auto Job Applier background service worker loaded'); 