document.addEventListener('DOMContentLoaded', function() {
    // Initialize form functionality
    initForm();
});

function initForm() {
    const form = document.getElementById('expertApplicationForm');
    const specialtySelect = document.getElementById('specialty');
    const otherSpecialtyGroup = document.getElementById('otherSpecialtyGroup');
    const uploadBoxes = document.querySelectorAll('.upload-box');

    // Handle specialty selection
    specialtySelect.addEventListener('change', function() {
        if (this.value === 'other') {
            otherSpecialtyGroup.style.display = 'block';
            document.getElementById('otherSpecialty').required = true;
        } else {
            otherSpecialtyGroup.style.display = 'none';
            document.getElementById('otherSpecialty').required = false;
        }
    });

    // Handle file uploads
    uploadBoxes.forEach(box => {
        const input = box.querySelector('input[type="file"]');
        
        // Handle click
        box.addEventListener('click', () => input.click());
        
        // Handle drag and drop
        box.addEventListener('dragover', (e) => {
            e.preventDefault();
            box.classList.add('dragover');
        });
        
        box.addEventListener('dragleave', () => {
            box.classList.remove('dragover');
        });
        
        box.addEventListener('drop', (e) => {
            e.preventDefault();
            box.classList.remove('dragover');
            input.files = e.dataTransfer.files;
            updateFileLabel(box, e.dataTransfer.files[0]);
        });
        
        // Handle file selection
        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                updateFileLabel(box, input.files[0]);
            }
        });
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            const submitBtn = form.querySelector('.submit-btn');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(form);
                // TODO: Replace with your API endpoint
                const response = await fetch('/api/expert-applications', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    showNotification('Application submitted successfully!', 'success');
                    form.reset();
                    resetFileUploads();
                } else {
                    throw new Error('Failed to submit application');
                }
            } catch (error) {
                showNotification('Error submitting application. Please try again.', 'error');
                console.error('Submission error:', error);
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        }
    });
}

function addQualification() {
    const qualificationsList = document.getElementById('qualificationsList');
    const newEntry = document.createElement('div');
    newEntry.className = 'qualification-entry';
    newEntry.innerHTML = `
        <div class="form-group">
            <label>Degree/Certification*</label>
            <input type="text" name="qualification[]" required>
        </div>
        <div class="form-group">
            <label>Institution*</label>
            <input type="text" name="institution[]" required>
        </div>
        <div class="form-group">
            <label>Year Obtained*</label>
            <input type="number" name="year[]" min="1900" max="2024" required>
        </div>
        <button type="button" class="remove-btn" onclick="removeQualification(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    qualificationsList.appendChild(newEntry);
}

function removeQualification(button) {
    const entry = button.closest('.qualification-entry');
    entry.remove();
}

function addExperience() {
    const experienceList = document.getElementById('experienceList');
    const newEntry = document.createElement('div');
    newEntry.className = 'experience-entry';
    newEntry.innerHTML = `
        <div class="form-group">
            <label>Position*</label>
            <input type="text" name="position[]" required>
        </div>
        <div class="form-group">
            <label>Organization*</label>
            <input type="text" name="organization[]" required>
        </div>
        <div class="form-group">
            <label>Duration*</label>
            <div class="duration-inputs">
                <input type="month" name="startDate[]" required>
                <span>to</span>
                <input type="month" name="endDate[]" required>
            </div>
        </div>
        <button type="button" class="remove-btn" onclick="removeExperience(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    experienceList.appendChild(newEntry);
}

function removeExperience(button) {
    const entry = button.closest('.experience-entry');
    entry.remove();
}

function updateFileLabel(uploadBox, file) {
    const label = uploadBox.querySelector('p');
    if (file) {
        label.textContent = file.name;
        uploadBox.classList.add('has-file');
    } else {
        label.textContent = 'Click to upload or drag and drop';
        uploadBox.classList.remove('has-file');
    }
}

function resetFileUploads() {
    document.querySelectorAll('.upload-box').forEach(box => {
        const input = box.querySelector('input[type="file"]');
        input.value = '';
        updateFileLabel(box, null);
    });
}

function validateForm() {
    const form = document.getElementById('expertApplicationForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            showError(field, 'This field is required');
        } else {
            clearError(field);
        }
    });

    // Validate email format
    const email = form.querySelector('#email');
    if (email.value && !isValidEmail(email.value)) {
        isValid = false;
        showError(email, 'Please enter a valid email address');
    }

    // Validate phone number
    const phone = form.querySelector('#phone');
    if (phone.value && !isValidPhone(phone.value)) {
        isValid = false;
        showError(phone, 'Please enter a valid phone number');
    }

    // Validate dates
    const startDates = form.querySelectorAll('input[name="startDate[]"]');
    const endDates = form.querySelectorAll('input[name="endDate[]"]');
    
    startDates.forEach((startDate, index) => {
        const endDate = endDates[index];
        if (startDate.value && endDate.value && startDate.value > endDate.value) {
            isValid = false;
            showError(endDate, 'End date must be after start date');
        }
    });

    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^\+?[\d\s-]{10,}$/.test(phone);
}

function showError(field, message) {
    const errorDiv = field.parentElement.querySelector('.error-message') || 
                    document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    if (!field.parentElement.querySelector('.error-message')) {
        field.parentElement.appendChild(errorDiv);
    }
    
    field.classList.add('error');
}

function clearError(field) {
    const errorDiv = field.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.classList.remove('error');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 