// Make handleLogout globally accessible
window.handleLogout = async function(e) {
    e.preventDefault();
    console.log('Logout button clicked');
    
    try {
        // Clear the token first to ensure immediate logout
        localStorage.removeItem('token');
        
        // Then try to notify the server
        const response = await fetch('http://localhost:3000/api/v1/users/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        // Even if server logout fails, we've already cleared the token
        // so we can proceed with redirect
        console.log('Redirecting to homepage...');
        window.location.href = 'homepage.html';
    } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect to homepage even if server logout fails
        window.location.href = 'homepage.html';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        // If no token, redirect to homepage instead of login page
        window.location.href = 'homepage.html';
        return;
    }

    // Verify token is valid by trying to load user data
    try {
        const response = await fetch('http://localhost:3000/api/v1/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // If token is invalid, clear it and redirect to homepage
            localStorage.removeItem('token');
            window.location.href = 'homepage.html';
            return;
        }
        
        // Load user data if token is valid
        await loadUserData();

        // Add event listeners
        document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
        document.getElementById('babyForm').addEventListener('submit', handleBabyInfoUpdate);
        document.getElementById('passwordForm').addEventListener('submit', handlePasswordChange);
        document.getElementById('deleteAccount').addEventListener('click', handleDeleteAccount);
        document.getElementById('avatarInput').addEventListener('change', handleAvatarChange);
        document.getElementById('birthDate').addEventListener('change', updateAgeDisplay);
    } catch (error) {
        console.error('Error verifying session:', error);
        // If there's an error, clear token and redirect to homepage
        localStorage.removeItem('token');
        window.location.href = 'homepage.html';
    }
});

// Toggle between display and edit modes
window.toggleEdit = function(section) {
    const displayDiv = document.querySelector(`#${section}Form`).previousElementSibling;
    const form = document.getElementById(`${section}Form`);
    
    if (form.style.display === 'none') {
        displayDiv.style.display = 'none';
        form.style.display = 'block';
    } else {
        displayDiv.style.display = 'block';
        form.style.display = 'none';
    }
}

async function loadUserData() {
    try {
        const token = localStorage.getItem('token');
        console.log('Loading user data with token:', token);

        if (!token) {
            console.error('No token found');
            window.location.href = 'homepage.html';
            return;
        }

        const response = await fetch('http://localhost:3000/api/v1/users/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Profile API response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Profile API error:', errorData || response.statusText);
            throw new Error(`Failed to load user data: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json();
        console.log('Raw user data from server:', userData);
        
        // Update profile header
        const user = userData.user || userData;

const username = user.username || 'Not set';
const email = user.email || 'Not set';
const babyName = user.babyName || 'Not set';
const babyGender = user.babyGender || 'Not set';
const birthDate = user.birthDate || null;
const profilePicture = user.profilePicture || null;


        console.log('Processed user data:', {
            username,
            email,
            babyName,
            babyGender,
            birthDate,
            profilePicture
        });

        // Update profile header
        document.getElementById('username').textContent = username || 'Not set';
        document.getElementById('userEmail').textContent = email || 'Not set';
        
        // Update account information display
        document.getElementById('displayNameDisplay').textContent = username || 'Not set';
        document.getElementById('emailDisplay').textContent = email || 'Not set';
        
        // Update account information form
        document.getElementById('displayName').value = username || '';
        document.getElementById('email').value = email || '';
        
        // Update baby information display
        document.getElementById('babyNameDisplay').textContent = babyName || 'Not set';
        document.getElementById('babyGenderDisplay').textContent = babyGender ? 
            (babyGender === 'male' ? 'Boy' : 'Girl') : 'Not set';
        document.getElementById('birthDateDisplay').textContent = birthDate ? 
            new Date(birthDate).toLocaleDateString() : 'Not set';
        
        // Calculate and display age
        if (birthDate) {
            const birthDateObj = new Date(birthDate);
            const today = new Date();
            const ageInMonths = (today.getFullYear() - birthDateObj.getFullYear()) * 12 + 
                              (today.getMonth() - birthDateObj.getMonth());
            const years = Math.floor(ageInMonths / 12);
            const months = ageInMonths % 12;
            let ageText = '';
            if (years > 0) {
                ageText += `${years} year${years > 1 ? 's' : ''}`;
            }
            if (months > 0) {
                if (ageText) ageText += ' and ';
                ageText += `${months} month${months > 1 ? 's' : ''}`;
            }
            document.getElementById('ageDisplay').textContent = ageText || 'Less than 1 month';
        } else {
            document.getElementById('ageDisplay').textContent = 'Not set';
        }
        
        // Update baby information form
        document.getElementById('babyName').value = babyName || '';
        if (babyGender) {
            const genderRadio = document.querySelector(`input[name="babyGender"][value="${babyGender}"]`);
            if (genderRadio) {
                genderRadio.checked = true;
            }
        }
        if (birthDate) {
            document.getElementById('birthDate').value = birthDate;
        }

        // Update profile picture if exists
        if (profilePicture) {
            document.getElementById('profilePicture').src = profilePicture;
        } else {
            document.getElementById('profilePicture').src = '../images/default-avatar.png';
        }

    } catch (error) {
        console.error('Error loading user data:', error);
        // Show error in the UI
        document.getElementById('username').textContent = 'Error loading profile';
        document.getElementById('userEmail').textContent = 'Please try refreshing the page';
        // Disable forms
        document.getElementById('profileForm').style.opacity = '0.5';
        document.getElementById('babyForm').style.opacity = '0.5';
        document.getElementById('passwordForm').style.opacity = '0.5';
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const displayName = document.getElementById('displayName').value;
    
    try {
        const response = await fetch('http://localhost:3000/api/v1/users/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ username: displayName })
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        alert('Profile updated successfully!');
        document.getElementById('username').textContent = displayName;
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
    }
}

async function handleBabyInfoUpdate(e) {
    e.preventDefault();
    
    const babyName = document.getElementById('babyName').value;
    const babyGender = document.querySelector('input[name="babyGender"]:checked')?.value;
    const birthDate = document.getElementById('birthDate').value;
    
    try {
        const response = await fetch('http://localhost:3000/api/v1/users/baby-info', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ babyName, babyGender, birthDate })
        });

        if (!response.ok) {
            throw new Error('Failed to update baby information');
        }

        alert('Baby information updated successfully!');
    } catch (error) {
        console.error('Error updating baby information:', error);
        alert('Failed to update baby information. Please try again.');
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/v1/users/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (!response.ok) {
            throw new Error('Failed to change password');
        }

        alert('Password changed successfully!');
        e.target.reset();
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Failed to change password. Please try again.');
    }
}

async function handleDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/v1/users/delete-account', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete account');
        }

        localStorage.removeItem('token');
        alert('Account deleted successfully. You will be redirected to the login page.');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account. Please try again.');
    }
}

async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await fetch('http://localhost:3000/api/v1/users/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to update avatar');
        }

        const data = await response.json();
        document.getElementById('profilePicture').src = data.avatarUrl;
        alert('Profile picture updated successfully!');
    } catch (error) {
        console.error('Error updating avatar:', error);
        alert('Failed to update profile picture. Please try again.');
    }
}

function updateAgeDisplay() {
    const birthDate = document.getElementById('birthDate').value;
    if (!birthDate) return;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    const ageDisplay = document.getElementById('ageDisplay');
    if (age < 1) {
        ageDisplay.textContent = 'Less than 1 year old';
    } else if (age === 1) {
        ageDisplay.textContent = '1 year old';
    } else {
        ageDisplay.textContent = `${age} years old`;
    }
} 