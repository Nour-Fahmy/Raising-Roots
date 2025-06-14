// Initialize users array
const users = [
    // Sample users
    { 
        username: 'admin', 
        email: 'admin@example.admin', 
        password: 'Admin123!', 
        role: 'admin',
        babyName: 'Admin Baby',
        babyGender: 'male',
        birthDate: '2020-01-01'
    },
    { 
        username: 'user', 
        email: 'user@example.com', 
        password: 'User123!', 
        role: 'user',
        babyName: 'User Baby',
        babyGender: 'female',
        birthDate: '2021-05-15'
    }
];

// DOM Elements
const formsContainer = document.querySelector('.forms-container');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const birthDateInput = document.getElementById('signupBirthDate');
const ageDisplay = document.getElementById('ageDisplay');

// Function to show/hide forms with sliding overlay
function showForm(formType) {
    if (formType === 'login') {
        formsContainer.classList.remove('slide-right');
    } else {
        formsContainer.classList.add('slide-right');
    }
}

// Function to validate email
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Function to validate password
function isValidPassword(password) {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
}

// Function to determine role based on email domain
function determineRole(email) {
    // If email ends with .admin, they are an admin
    if (email.toLowerCase().endsWith('.admin')) {
        return 'admin';
    }
    // Otherwise, they are a regular user
    return 'user';
}

// Function to calculate age from birth date
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// Function to format age display
function formatAgeDisplay(age) {
    if (age < 1) {
        return 'Less than 1 year old';
    } else if (age === 1) {
        return '1 year old';
    } else {
        return `${age} years old`;
    }
}

// Function to update age display
function updateAgeDisplay() {
    const birthDate = birthDateInput.value;
    if (birthDate) {
        const age = calculateAge(birthDate);
        ageDisplay.textContent = `${age} years old`;
    } else {
        ageDisplay.textContent = '';
    }
}

// Add event listeners for interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for birth date input
    if (birthDateInput) {
        birthDateInput.addEventListener('change', updateAgeDisplay);
    }
});

// Validation functions
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(`${inputId}Error`);
    
    input.classList.add('input-error');
    input.classList.remove('input-success');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function showSuccess(inputId) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(`${inputId}Error`);
    
    input.classList.remove('input-error');
    input.classList.add('input-success');
    errorElement.style.display = 'none';
}

function clearError(inputId) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(`${inputId}Error`);
    
    input.classList.remove('input-error', 'input-success');
    errorElement.style.display = 'none';
}

function showFormFeedback(formId, message, isError = true) {
    const feedbackElement = document.getElementById(`${formId}Feedback`);
    feedbackElement.textContent = message;
    feedbackElement.className = `form-feedback ${isError ? 'feedback-error' : 'feedback-success'}`;
    feedbackElement.style.display = 'block';
}

function clearFormFeedback(formId) {
    const feedbackElement = document.getElementById(`${formId}Feedback`);
    feedbackElement.style.display = 'none';
}

// Username validation
function validateUsername(username) {
    if (!username) {
        return 'Username is required';
    }
    if (username.length < 3) {
        return 'Username must be at least 3 characters long';
    }
    if (username.length > 20) {
        return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
}

// Email validation
function validateEmail(email) {
    if (!email) {
        return 'Email is required';
    }
    if (!isValidEmail(email)) {
        return 'Please enter a valid email address';
    }
    return '';
}

// Password validation
function validatePassword(password) {
    if (!password) {
        return 'Password is required';
    }
    if (password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (!isValidPassword(password)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    return '';
}

// Baby name validation
function validateBabyName(name) {
    if (!name) {
        return 'Baby name is required';
    }
    if (name.length < 2) {
        return 'Baby name must be at least 2 characters long';
    }
    if (name.length > 50) {
        return 'Baby name must be less than 50 characters';
    }
    return '';
}

// Birth date validation
function validateBirthDate(date) {
    if (!date) {
        return 'Birth date is required';
    }
    const birthDate = new Date(date);
    const today = new Date();
    if (birthDate > today) {
        return 'Birth date cannot be in the future';
    }
    const age = calculateAge(date);
    if (age > 2) {
        return 'Baby age cannot be more than 2 years';
    }
    return '';
}

// Password strength checker
function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('passwordStrengthBar');
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    strengthBar.className = 'password-strength-bar';
    if (strength <= 2) {
        strengthBar.classList.add('strength-weak');
    } else if (strength <= 4) {
        strengthBar.classList.add('strength-medium');
    } else {
        strengthBar.classList.add('strength-strong');
    }
}

// Add event listeners for real-time validation
document.addEventListener('DOMContentLoaded', function() {
    // Login form validation
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    loginEmail.addEventListener('input', () => {
        const error = validateEmail(loginEmail.value);
        if (error) {
            showError('loginEmail', error);
        } else {
            showSuccess('loginEmail');
        }
    });
    
    loginPassword.addEventListener('input', () => {
        const error = validatePassword(loginPassword.value);
        if (error) {
            showError('loginPassword', error);
        } else {
            showSuccess('loginPassword');
        }
    });
    
    // Signup form validation
    const signupUsername = document.getElementById('signupUsername');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const signupBabyName = document.getElementById('signupBabyName');
    const signupBirthDate = document.getElementById('signupBirthDate');
    
    signupUsername.addEventListener('input', () => {
        const error = validateUsername(signupUsername.value);
        if (error) {
            showError('signupUsername', error);
        } else {
            showSuccess('signupUsername');
        }
    });
    
    signupEmail.addEventListener('input', () => {
        const error = validateEmail(signupEmail.value);
        if (error) {
            showError('signupEmail', error);
        } else {
            showSuccess('signupEmail');
        }
    });
    
    signupPassword.addEventListener('input', () => {
        const error = validatePassword(signupPassword.value);
        if (error) {
            showError('signupPassword', error);
        } else {
            showSuccess('signupPassword');
        }
        checkPasswordStrength(signupPassword.value);
    });
    
    signupBabyName.addEventListener('input', () => {
        const error = validateBabyName(signupBabyName.value);
        if (error) {
            showError('signupBabyName', error);
        } else {
            showSuccess('signupBabyName');
        }
    });
    
    signupBirthDate.addEventListener('input', () => {
        const error = validateBirthDate(signupBirthDate.value);
        if (error) {
            showError('signupBirthDate', error);
        } else {
            showSuccess('signupBirthDate');
        }
        updateAgeDisplay();
    });
});

// Function to get redirect URL from query parameters
function getRedirectUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    let redirectUrl = urlParams.get('redirect') || 'homepage.html';
    
    // Remove any leading slashes or parent directory references
    redirectUrl = redirectUrl.replace(/^[\/\.]+/, '');
    
    // If the URL contains 'pages/', remove it since we're already in the pages directory
    redirectUrl = redirectUrl.replace(/^pages\//, '');
    
    return redirectUrl;
}

// Function to handle successful login
async function handleSuccessfulLogin(userData) {
    try {
        // Store the token and user data in localStorage
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData.user));
        
        // Preserve the cart data during login
        const existingCart = localStorage.getItem('cart');
        if (existingCart) {
            // Keep the existing cart data
            console.log('Preserving existing cart during login:', existingCart);
        }
        
        // Get redirect URL
        const redirectUrl = getRedirectUrl();
        
        // If user is admin and trying to access admin panel, redirect there
        if (userData.user.role === 'admin' && redirectUrl.includes('admin')) {
            window.location.href = redirectUrl;
            return;
        }
        
        // For non-admin users trying to access admin panel, show error
        if (redirectUrl.includes('admin') && userData.user.role !== 'admin') {
            showFormFeedback('login', 'Access denied. Admin privileges required.');
            return;
        }
        
        // Redirect to the appropriate page
        window.location.href = redirectUrl;
    } catch (error) {
        console.error('Error during login:', error);
        showFormFeedback('login', 'An error occurred during login. Please try again.');
    }
}

// Login form submission
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Clear previous feedback
    clearFormFeedback('login');
    
    // Validate inputs
    const emailError = validateEmail(email);
    if (emailError) {
        showError('loginEmail', emailError);
        return;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
        showError('loginPassword', passwordError);
        return;
    }
    
    try {
        const response = await fetch('https://localhost:3000/api/v1/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            await handleSuccessfulLogin(data);
        } else {
            showFormFeedback('login', data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showFormFeedback('login', 'An error occurred. Please try again.');
    }
});

// Signup form submission
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const babyName = document.getElementById('signupBabyName').value;
    const babyGender = document.querySelector('input[name="babyGender"]:checked')?.value;
    const birthDate = document.getElementById('signupBirthDate').value;
    
    // Clear previous feedback
    clearFormFeedback('signup');
    
    // Validate all inputs
    const usernameError = validateUsername(username);
    if (usernameError) {
        showError('signupUsername', usernameError);
        return;
    }
    
    const emailError = validateEmail(email);
    if (emailError) {
        showError('signupEmail', emailError);
        return;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
        showError('signupPassword', passwordError);
        return;
    }
    
    const babyNameError = validateBabyName(babyName);
    if (babyNameError) {
        showError('signupBabyName', babyNameError);
        return;
    }
    
    if (!babyGender) {
        showError('signupBabyGender', 'Please select baby gender');
        return;
    }
    
    const birthDateError = validateBirthDate(birthDate);
    if (birthDateError) {
        showError('signupBirthDate', birthDateError);
        return;
    }
    
    try {
        const response = await fetch('https://localhost:3000/api/v1/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password,
                babyName,
                babyGender,
                birthDate
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success message
            showFormFeedback('signup', 'Account created successfully! Please log in.', false);
            
            // Clear the form
            signupForm.reset();
            
            // Wait for 1.5 seconds to show the success message
            setTimeout(() => {
                // Switch to login form
                showForm('login');
                // Show login success message
                showFormFeedback('login', 'Please log in with your new account.', false);
            }, 1500);
        } else {
            showFormFeedback('signup', data.message || 'Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showFormFeedback('signup', 'An error occurred. Please try again.');
    }
});

// Function to toggle password visibility
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = passwordInput.nextElementSibling;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
} 

// Function to update translations and layout
function updateTranslations() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });

    // Update all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[currentLanguage][key]) {
            element.placeholder = translations[currentLanguage][key];
        }
    });

    // Update document direction based on language
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
}

// Function to update password strength bar
function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strength = validatePassword(password) ? 100 : 
                    password.length >= 6 ? 50 : 
                    password.length >= 4 ? 25 : 0;
    
    strengthBar.style.width = `${strength}%`;
    strengthBar.style.backgroundColor = strength === 100 ? '#4CAF50' : 
                                      strength === 50 ? '#FFC107' : 
                                      strength === 25 ? '#FF9800' : '#F44336';
} 