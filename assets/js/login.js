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

// Handle signup form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const babyName = document.getElementById('signupBabyName').value;
    const babyGender = document.querySelector('input[name="babyGender"]:checked')?.value;
    const birthDate = document.getElementById('signupBirthDate').value;
    const role = determineRole(email);
    
    try {
        // Validate username
        if (username.length < 3) {
            alert('Username must be at least 3 characters long!');
            return;
        }

        // Validate email
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address!');
            return;
        }

        // Validate password
        if (!isValidPassword(password)) {
            alert('Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters!');
            return;
        }

        // Validate baby name
        if (babyName.length < 2) {
            alert('Please enter a valid baby name!');
            return;
        }

        // Validate baby gender
        if (!babyGender) {
            alert('Please select a baby gender!');
            return;
        }

        // Validate birth date
        if (!birthDate) {
            alert('Please select a birth date!');
            return;
        }

        // Calculate age
        const age = calculateAge(birthDate);
        if (age < 0) {
            alert('Birth date cannot be in the future!');
            return;
        }

        // Check if user already exists
        if (users.find(user => user.email === email || user.username === username)) {
            alert('User with this email or username already exists!');
            return;
        }

        // Add new user to array
        users.push({ 
            username, 
            email, 
            password, 
            role,
            babyName,
            babyGender,
            birthDate
        });
        
        alert(`Signup successful! You have been registered as a ${role}. Please login.`);
        console.log('Current users:', users);
        showForm('login');
        signupForm.reset();
    } catch (error) {
        console.error('Signup error:', error);
        // Show error message to user
    }
});

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        // Validate email format
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address!');
            return;
        }

        // Find user by email
        const user = users.find(u => u.email === email);
        
        if (!user) {
            alert('No account found with this email!');
            return;
        }

        // Check password
        if (user.password !== password) {
            alert('Incorrect password!');
            return;
        }

        // Successful login
        if (user.role === 'admin') {
            alert(`Welcome Admin! Your baby ${user.babyName} is ${formatAgeDisplay(calculateAge(user.birthDate))}.`);
            // Redirect to admin dashboard
            window.location.href = '../admin/index.html';
        } else {
            alert(`Welcome! Your baby ${user.babyName} is ${formatAgeDisplay(calculateAge(user.birthDate))}.`);
            // Redirect to user dashboard
            window.location.href = '../homepage/index.html';
        }
        loginForm.reset();
    } catch (error) {
        console.error('Login error:', error);
        // Show error message to user
    }
}); 