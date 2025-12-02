// Password Strength Analyzer & Breach Checker

const passwordInput = document.getElementById('password');
const toggleVisibility = document.getElementById('toggleVisibility');
let eyeIcon = document.getElementById('eyeIcon');
const strengthBar = document.getElementById('strengthBar');
const strengthLabel = document.getElementById('strengthLabel');
const strengthDetails = document.getElementById('strengthDetails');
const scoreValue = document.getElementById('scoreValue');
const crackTime = document.getElementById('crackTime');
const guesses = document.getElementById('guesses');
const feedbackSection = document.getElementById('feedbackSection');
const feedbackList = document.getElementById('feedbackList');
const breachStatus = document.getElementById('breachStatus');
const breachMessage = document.getElementById('breachMessage');
const breachSpinner = document.getElementById('breachSpinner');
const requirementsList = document.getElementById('requirementsList');

// Strength labels and colors
const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['strength-0', 'strength-1', 'strength-2', 'strength-3', 'strength-4'];

// Toggle password visibility
toggleVisibility.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Update eye icon - replace entire SVG
    if (type === 'text') {
        eyeIcon.outerHTML = `
            <svg id="eyeIcon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
            </svg>
        `;
    } else {
        eyeIcon.outerHTML = `
            <svg id="eyeIcon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
        `;
    }
    // Re-reference the element after replacement
    eyeIcon = document.getElementById('eyeIcon');
});

// Analyze password strength
function analyzePassword(password) {
    if (!password) {
        resetUI();
        return;
    }

    // Use zxcvbn for strength analysis
    const result = zxcvbn(password);
    const score = result.score;
    
    // Update strength bar
    const percentage = ((score + 1) / 5) * 100;
    strengthBar.style.width = `${percentage}%`;
    strengthBar.className = `h-full transition-all duration-500 rounded-full ${strengthColors[score]}`;
    
    // Update strength label
    strengthLabel.textContent = strengthLabels[score];
    strengthLabel.className = `text-sm font-semibold ${getStrengthTextColor(score)}`;
    
    // Update details
    scoreValue.textContent = `${score}/4`;
    crackTime.textContent = formatCrackTime(result.crack_times_seconds.offline_slow_hashing_1e4_per_second);
    guesses.textContent = result.guesses_log10.toFixed(1);
    strengthDetails.classList.remove('hidden');
    
    // Update feedback
    updateFeedback(result);
    
    // Update requirements
    updateRequirements(password);
    
    // Check breach status (debounced to avoid excessive API calls)
    debounceBreachCheck(password);
}

// Format crack time
function formatCrackTime(seconds) {
    if (seconds < 1) return 'Instant';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
    return `${Math.round(seconds / 31536000)} years`;
}

// Get strength text color
function getStrengthTextColor(score) {
    const colors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600', 'text-green-700'];
    return colors[score];
}

// Update feedback section
function updateFeedback(result) {
    feedbackList.innerHTML = '';
    
    if (result.feedback.warning) {
        const warningItem = document.createElement('li');
        warningItem.className = 'feedback-item warning';
        warningItem.textContent = `⚠️ ${result.feedback.warning}`;
        feedbackList.appendChild(warningItem);
    }
    
    if (result.feedback.suggestions && result.feedback.suggestions.length > 0) {
        result.feedback.suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('li');
            suggestionItem.className = 'feedback-item suggestion';
            suggestionItem.textContent = `💡 ${suggestion}`;
            feedbackList.appendChild(suggestionItem);
        });
    }
    
    if (feedbackList.children.length > 0) {
        feedbackSection.classList.remove('hidden');
    } else {
        feedbackSection.classList.add('hidden');
    }
}

// Update requirements checklist
function updateRequirements(password) {
    const requirements = [
        { test: password.length >= 8, text: 'At least 8 characters' },
        { test: /[A-Z]/.test(password), text: 'Contains uppercase letter' },
        { test: /[a-z]/.test(password), text: 'Contains lowercase letter' },
        { test: /[0-9]/.test(password), text: 'Contains number' },
        { test: /[^A-Za-z0-9]/.test(password), text: 'Contains special character' }
    ];
    
    const items = requirementsList.querySelectorAll('li');
    items.forEach((item, index) => {
        const icon = item.querySelector('.requirement-icon');
        const requirement = requirements[index];
        
        if (requirement.test) {
            icon.textContent = '✓';
            icon.className = 'requirement-icon valid';
            icon.style.backgroundColor = '#10b981';
            icon.style.color = 'white';
            item.style.color = '#10b981';
        } else {
            icon.textContent = '✗';
            icon.className = 'requirement-icon invalid';
            icon.style.backgroundColor = '#ef4444';
            icon.style.color = 'white';
            item.style.color = '#6b7280';
        }
    });
}

// Check password breach using Have I Been Pwned API
async function checkBreach(password) {
    if (!password) {
        breachStatus.className = 'flex items-center space-x-3 p-4 rounded-lg';
        breachMessage.textContent = 'Enter a password to check if it\'s been compromised';
        breachSpinner.classList.add('hidden');
        return;
    }
    
    // Show loading state
    breachStatus.className = 'flex items-center space-x-3 p-4 rounded-lg breach-checking';
    breachMessage.textContent = 'Checking breach database...';
    breachSpinner.classList.remove('hidden');
    
    try {
        // Hash password with SHA-1
        const hash = CryptoJS.SHA1(password).toString().toUpperCase();
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);
        
        // Use k-anonymity API (only send first 5 chars of hash)
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        
        if (!response.ok) {
            throw new Error('Failed to check breach database');
        }
        
        const data = await response.text();
        const hashes = data.split('\n');
        
        // Check if our hash suffix is in the results
        const found = hashes.some(line => {
            const [hashSuffix, count] = line.split(':');
            return hashSuffix === suffix;
        });
        
        // Update UI
        breachSpinner.classList.add('hidden');
        
        if (found) {
            const match = hashes.find(line => {
                const [hashSuffix] = line.split(':');
                return hashSuffix === suffix;
            });
            const count = match ? parseInt(match.split(':')[1].trim()) : 0;
            
            breachStatus.className = 'flex items-center space-x-3 p-4 rounded-lg breach-compromised';
            breachMessage.innerHTML = `
                <span class="font-semibold">⚠️ Password Found in Breach Database!</span><br>
                <span class="text-sm">This password has appeared in ${count.toLocaleString()} data breaches. You should change it immediately.</span>
            `;
        } else {
            breachStatus.className = 'flex items-center space-x-3 p-4 rounded-lg breach-safe';
            breachMessage.innerHTML = `
                <span class="font-semibold">✓ Password Not Found in Breach Database</span><br>
                <span class="text-sm">This password has not been found in any known data breaches.</span>
            `;
        }
    } catch (error) {
        console.error('Error checking breach:', error);
        breachSpinner.classList.add('hidden');
        breachStatus.className = 'flex items-center space-x-3 p-4 rounded-lg';
        breachMessage.textContent = 'Unable to check breach database. Please try again later.';
    }
}

// Reset UI
function resetUI() {
    // Clear any pending breach check
    clearTimeout(breachCheckTimeout);
    
    strengthBar.style.width = '0%';
    strengthLabel.textContent = '-';
    strengthDetails.classList.add('hidden');
    feedbackSection.classList.add('hidden');
    breachStatus.className = 'flex items-center space-x-3 p-4 rounded-lg';
    breachMessage.textContent = 'Enter a password to check if it\'s been compromised';
    breachSpinner.classList.add('hidden');
    
    // Reset requirements
    const items = requirementsList.querySelectorAll('li');
    items.forEach(item => {
        const icon = item.querySelector('.requirement-icon');
        icon.textContent = '-';
        icon.className = 'requirement-icon';
        icon.style.backgroundColor = 'transparent';
        icon.style.color = 'inherit';
        item.style.color = '#6b7280';
    });
}

// Event listener for password input
passwordInput.addEventListener('input', (e) => {
    analyzePassword(e.target.value);
});

// Debounce function for breach check (optional optimization)
let breachCheckTimeout;
function debounceBreachCheck(password) {
    clearTimeout(breachCheckTimeout);
    breachCheckTimeout = setTimeout(() => {
        checkBreach(password);
    }, 500);
}

