// Profile functionality for BabyCare pages
async function loadProfileContent() {
    const navRight = document.querySelector('.nav-right');
    let isLoggedIn = false;
    let userData = null;

    // Check if token exists and is valid
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('http://localhost:3000/api/v1/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                userData = await response.json();
                isLoggedIn = true;
            } else {
                // If token is invalid, remove it
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Error verifying token:', error);
            // If there's an error, remove the token
            localStorage.removeItem('token');
        }
    }

    // Create profile content based on login state
    if (isLoggedIn) {
        navRight.innerHTML = `
            <div class="profile-dropdown">
                <button class="profile-btn">
                    <img src="${userData?.profilePicture || '../../images/default-avatar.png'}" 
                         alt="Profile" 
                         class="profile-img">
                    <span>${userData?.username || 'Profile'}</span>
                </button>
                <div class="dropdown-content">
                    <a href="../profile.html">View Profile</a>
                    <a href="../profile.html#baby-info">Baby's Profile</a>
                    <a href="../shop.html">My Orders</a>
                    <a href="#" onclick="handleLogout(event)">Logout</a>
                </div>
            </div>
        `;

        // Add event listener for profile dropdown
        const profileBtn = navRight.querySelector('.profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                navRight.querySelector('.profile-dropdown').classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.profile-dropdown')) {
                    navRight.querySelector('.profile-dropdown')?.classList.remove('active');
                }
            });
        }
    } else {
        navRight.innerHTML = `
            <a href="../login.html?redirect=../pages/BabyCare/${window.location.pathname.split('/').pop()}" class="login-btn">Login</a>
            <a href="../login.html?redirect=../pages/BabyCare/${window.location.pathname.split('/').pop()}" class="signup-btn">Sign Up</a>
        `;
    }
}

// Handle logout
async function handleLogout(e) {
    if (e) e.preventDefault();
    
    try {
        // Clear the token first to ensure immediate logout
        localStorage.removeItem('token');
        
        // Try to notify the server about logout
        const response = await fetch('http://localhost:3000/api/v1/users/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        // Redirect back to the current page
        window.location.href = window.location.pathname;
    } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect even if server logout fails
        window.location.href = window.location.pathname;
    }
}

// Load profile content when the page loads
document.addEventListener('DOMContentLoaded', loadProfileContent); 