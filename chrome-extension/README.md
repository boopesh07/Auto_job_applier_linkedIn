# LinkedIn Auto Job Applier - Chrome Extension

A Chrome extension that automates LinkedIn job applications with AI-powered form filling.

## Features

- **One-Click Application**: Apply to LinkedIn jobs with a single click
- **AI-Powered Responses**: Automatically answer application questions using AI
- **Smart Form Filling**: Intelligently fill out job application forms
- **Application Tracking**: Track your application history and success rate
- **Customizable Settings**: Configure personal details, preferences, and AI settings

## Installation

### Development Mode

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `chrome-extension` folder
5. The extension should now appear in your extensions list

### Backend Setup

The extension requires a Python backend service to function:

1. Navigate to the main project directory
2. Install dependencies: `pip install -r requirements.txt`
3. Start the backend: `python app.py`
4. The backend will run on `http://localhost:5000`

## Usage

1. **Setup**: Click the extension icon and go to Settings to configure your personal information
2. **Navigate**: Go to any LinkedIn job posting page
3. **Apply**: Click the "Autofill this job application!" button that appears on the page
4. **Monitor**: Use the extension popup to track your applications and status

## Configuration

### Personal Information
- Name, email, phone, address
- Resume upload
- Work preferences

### Job Preferences
- Preferred job titles and locations
- Experience level and salary range
- Remote work preferences

### AI Settings
- Enable/disable AI responses
- Choose AI provider (OpenAI, DeepSeek)
- Configure API keys

## Architecture

```
chrome-extension/
├── manifest.json          # Extension configuration
├── content/               # Content scripts for LinkedIn
├── background/            # Background service worker
├── popup/                 # Extension popup interface
├── options/               # Settings page
└── assets/                # Icons and styles
```

## Development

### Content Script
- Detects LinkedIn job pages
- Injects UI elements
- Extracts job information
- Communicates with background script

### Background Service Worker
- Handles communication with backend
- Manages extension state
- Processes API requests

### Popup Interface
- Shows application status
- Quick apply functionality
- Settings access

## Backend API

The extension communicates with a Python backend via REST API:

- `POST /api/apply-job` - Start job application process
- `GET /api/status` - Get current status
- `GET /api/config` - Get configuration
- `POST /api/config` - Update configuration

## Security

- API keys are stored securely in Chrome's sync storage
- All communication with backend is over HTTPS in production
- No sensitive data is transmitted to third parties

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the LICENSE file for details.

## Support

For support and questions:
- GitHub Issues: [Create an issue](https://github.com/GodsScion/Auto_job_applier_linkedIn/issues)
- Discord: [Join our server](https://discord.gg/fFp7uUzWCY)

## Disclaimer

This extension is for educational purposes only. Please ensure compliance with LinkedIn's terms of service and use responsibly. 