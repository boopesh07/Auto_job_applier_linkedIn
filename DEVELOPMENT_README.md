# Boopesh's Development Branch

This branch contains custom modifications and extensions to the original Auto Job Applier LinkedIn project.

## Custom Features Added

### 1. Chrome Extension
- **Location**: `chrome-extension/` directory
- **Purpose**: Browser extension to enhance the job application automation experience
- **Features**: 
  - Popup interface for easy control
  - Content scripts for LinkedIn integration
  - Background service for automation coordination
  - Options page for configuration

### 2. Enhanced Easy Apply Functionality
- Cursor positioning fixes for better form interaction
- Improved application flow handling

## Installation & Setup

### Chrome Extension
1. Navigate to `chrome-extension/` directory
2. Follow the instructions in `chrome-extension/INSTALLATION.md`
3. Load the extension in Chrome developer mode

### Main Application
1. Install dependencies: `pip install -r requirements.txt`
2. Configure your settings in `config/secrets.py` (add your credentials)
3. Run the application: `python runAiBot.py`

## Development Notes

- This branch maintains compatibility with the original project
- All sensitive credentials have been removed from git history
- Chrome extension is fully functional and tested
- Easy apply cursor fixes improve automation reliability

## Files Modified/Added

### New Files:
- `chrome-extension/` - Complete chrome extension implementation
- `DEVELOPMENT_README.md` - This documentation

### Modified Files:
- Various core files for easy apply improvements
- Configuration files for enhanced functionality

## Security

- All API keys and credentials have been sanitized
- Template files provided for configuration
- Git history cleaned of sensitive information

## Testing

Refer to `chrome-extension/TESTING_GUIDE.md` for comprehensive testing instructions.

---

**Note**: This is a personal development branch. For the original project, refer to the upstream repository. 

# Privacy Policy for LinkedIn Auto Job Applier Chrome Extension

**Last updated: [Current Date]**

## Information We Collect
This extension operates locally and does not collect personal information except:
- Settings you configure (name, email, preferences)
- Local application history
- Data sent to AI services if enabled (OpenAI/DeepSeek)

## Data Usage
- Personal info used only for auto-filling forms
- All data stored locally in your browser
- No data transmitted to our servers

## Third-Party Services
- OpenAI: Subject to OpenAI's Privacy Policy
- DeepSeek: Subject to DeepSeek's Privacy Policy

## Contact: [your-email@example.com] 

# LinkedIn Auto Job Applier - Chrome Extension

Streamline your job search with AI-powered automation for LinkedIn applications.

## Key Features
✅ One-click job applications
✅ AI-powered form filling
✅ Smart question answering
✅ Application tracking
✅ Customizable preferences

## How It Works
1. Install extension and configure settings
2. Navigate to LinkedIn job postings
3. Click "Auto Apply" button
4. Watch as forms are filled automatically

## Requirements
- Chrome browser
- LinkedIn account
- Optional: AI API key for enhanced features

Perfect for job seekers who want to apply to more positions efficiently while maintaining quality applications. 