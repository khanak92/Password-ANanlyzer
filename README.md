# Password Strength Analyzer & Breach Checker

A simple, local web application that analyzes password strength and checks if passwords have been compromised in data breaches.

## Features

- **Password Strength Analysis**: Uses zxcvbn library to evaluate password strength with a 0-4 score
- **Real-time Feedback**: Provides suggestions and warnings based on password patterns
- **Breach Check**: Checks passwords against Have I Been Pwned database using k-anonymity (secure, only sends first 5 chars of hash)
- **Requirements Checklist**: Visual indicators for common password requirements
- **Modern UI**: Clean, responsive design using Tailwind CSS

## How to Run Locally

### Option 1: Direct File Opening (Simplest)

1. Simply open `index.html` in your web browser
2. No server or installation required!

### Option 2: Using a Local Server (Recommended)

#### Using Python (if installed):
```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

#### Using Node.js (if installed):
```bash
# Install http-server globally (one time)
npm install -g http-server

# Run the server
http-server -p 8000

# Then open http://localhost:8000 in your browser
```

#### Using VS Code:
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Technologies Used

- **HTML5**: Structure
- **Tailwind CSS**: Styling (via CDN)
- **JavaScript**: Core functionality
- **zxcvbn**: Password strength estimation library (via CDN)
- **CryptoJS**: SHA-1 hashing for breach checks (via CDN)
- **Have I Been Pwned API**: Breach database checking

## Security Notes

- **No Data Sent**: The breach check uses k-anonymity - only the first 5 characters of the SHA-1 hash are sent to the API
- **Client-Side Only**: All processing happens in your browser - no server required
- **No Storage**: Passwords are never stored or saved anywhere

## Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- Fetch API
- CSS Grid/Flexbox

## License

Free to use and modify for personal or commercial projects.

