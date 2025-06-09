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
  
    try {
      // Validate inputs (basic frontend validation)
      if (!username || !email || !password || !babyName || !babyGender || !birthDate) {
        alert('Please fill in all fields!');
        return;
      }
  
      const response = await fetch('http://localhost:3000/api/v1/users/register', {
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
  
      if (!response.ok) {
        alert(data.message || 'Signup failed!');
        return;
      }
  
      alert('Signup successful! Please log in.');
      signupForm.reset();
      showForm('login'); // switch to login form if using a sliding overlay
  
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred while signing up.');
    }
  });
  

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3000/api/v1/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Login failed!');
            return;
        }

        // Save token in localStorage
        localStorage.setItem('token', data.token);

        alert(`Welcome ${data.user.username}!`);
        
        // Redirect based on role
        if (data.user.role === 'admin') {
            window.location.href = '../pages/admin/index.html';
        } else {
            window.location.href = '../pages/homepage.html';
        }

    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred while logging in.');
    }

    loginForm.reset();
}); 