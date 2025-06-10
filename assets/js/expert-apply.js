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

// Profile Picture Preview
document.getElementById('profilePicture').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        const preview = document.getElementById('profilePreview');
        const placeholder = document.querySelector('.upload-placeholder');

        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        }

        reader.readAsDataURL(file);
    }
});

// Validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^01[0125][0-9]{8}$/;
    return phoneRegex.test(phone);
}

function validateDate(date) {
    const inputDate = new Date(date);
    const today = new Date();
    const minAge = 18;
    const maxAge = 70;
    
    const age = today.getFullYear() - inputDate.getFullYear();
    const monthDiff = today.getMonth() - inputDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < inputDate.getDate())) {
        age--;
    }
    
    return age >= minAge && age <= maxAge;
}

function validateConsultationFee(fee) {
    return !isNaN(fee) && fee > 0;
}

function validateCertifications() {
    const certifications = document.querySelectorAll('.certification-item');
    if (certifications.length === 0) {
        return false;
    }
    
    for (const cert of certifications) {
        const name = cert.querySelector('.certification-name').value.trim();
        const issuer = cert.querySelector('.certification-issuer').value.trim();
        const year = cert.querySelector('.certification-year').value;
        
        if (!name || !issuer || !year) {
            return false;
        }
        
        const yearNum = parseInt(year);
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()) {
            return false;
        }
    }
    return true;
}

function validateLanguages() {
    const languages = document.querySelectorAll('.language-item');
    if (languages.length === 0) {
        return false;
    }
    
    for (const lang of languages) {
        const language = lang.querySelector('.language-name').value.trim();
        const proficiency = lang.querySelector('.language-proficiency').value;
        
        if (!language || !proficiency) {
            return false;
        }
    }
    return true;
}

function validateAvailability() {
    const availability = document.querySelectorAll('.availability-item');
    if (availability.length === 0) {
        return false;
    }
    
    for (const slot of availability) {
        const day = slot.querySelector('.availability-day').value;
        const startTime = slot.querySelector('.availability-start').value;
        const endTime = slot.querySelector('.availability-end').value;
        
        if (!day || !startTime || !endTime) {
            return false;
        }
        
        if (startTime >= endTime) {
            return false;
        }
    }
    return true;
}

function validatePaymentMethods() {
    const paymentMethods = document.querySelectorAll('input[name="paymentMethods"]:checked');
    return paymentMethods.length > 0;
}

function validateProfilePicture() {
    const fileInput = document.getElementById('profilePicture');
    if (!fileInput.files || fileInput.files.length === 0) {
        return false;
    }
    
    const file = fileInput.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
        return false;
    }
    
    if (file.size > maxSize) {
        return false;
    }
    
    return true;
}

// Form validation
function validateForm() {
    const errors = [];
    
    // Basic Information
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const birthDate = document.getElementById('birthDate').value;
    const gender = document.getElementById('gender').value;
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const governorate = document.getElementById('governorate').value.trim();
    const education = document.getElementById('education').value.trim();
    const experience = document.getElementById('experience').value.trim();
    const specialization = document.getElementById('specialization').value.trim();
    const bio = document.getElementById('bio').value.trim();
    const consultationFee = document.getElementById('consultationFee').value;
    const termsAccepted = document.getElementById('termsAccepted').checked;

    if (!firstName) errors.push('First name is required');
    if (!lastName) errors.push('Last name is required');
    if (!email) errors.push('Email is required');
    if (!validateEmail(email)) errors.push('Please enter a valid email address');
    if (!phone) errors.push('Phone number is required');
    if (!validatePhone(phone)) errors.push('Please enter a valid Egyptian phone number');
    if (!birthDate) errors.push('Birth date is required');
    if (!validateDate(birthDate)) errors.push('You must be between 18 and 70 years old');
    if (!gender) errors.push('Please select your gender');
    if (!address) errors.push('Address is required');
    if (!city) errors.push('City is required');
    if (!governorate) errors.push('Governorate is required');
    if (!education) errors.push('Education details are required');
    if (!experience) errors.push('Experience details are required');
    if (!specialization) errors.push('Specialization is required');
    if (!bio) errors.push('Bio is required');
    if (!consultationFee) errors.push('Consultation fee is required');
    if (!validateConsultationFee(consultationFee)) errors.push('Please enter a valid consultation fee');
    if (!termsAccepted) errors.push('You must accept the terms and conditions');

    // Profile Picture
    if (!validateProfilePicture()) {
        errors.push('Please upload a valid profile picture (JPEG, PNG, or GIF, max 5MB)');
    }

    // Certifications
    if (!validateCertifications()) {
        errors.push('Please add at least one valid certification');
    }

    // Languages
    if (!validateLanguages()) {
        errors.push('Please add at least one language with proficiency level');
    }

    // Availability
    if (!validateAvailability()) {
        errors.push('Please add at least one valid availability slot');
    }

    // Payment Methods
    if (!validatePaymentMethods()) {
        errors.push('Please select at least one payment method');
    }

    return errors;
}

// Update form submission to include validation
document.getElementById('expertForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
        showNotification(errors.join('<br>'), 'error');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
        // Create FormData object
        const formData = new FormData(this);

        // Add other form data
        const formFields = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            birthDate: document.getElementById('birthDate').value,
            gender: document.getElementById('gender').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            governorate: document.getElementById('governorate').value,
            education: document.getElementById('education').value,
            experience: document.getElementById('experience').value,
            specialization: document.getElementById('specialization').value,
            bio: document.getElementById('bio').value,
            consultationFee: document.getElementById('consultationFee').value,
            termsAccepted: document.getElementById('termsAccepted').checked
        };

        // Add form fields to FormData
        Object.keys(formFields).forEach(key => {
            formData.append(key, formFields[key]);
        });

        // Add certifications
        const certifications = [];
        document.querySelectorAll('.certification-item').forEach(item => {
            certifications.push({
                name: item.querySelector('.certification-name').value,
                issuer: item.querySelector('.certification-issuer').value,
                year: item.querySelector('.certification-year').value
            });
        });
        formData.append('certifications', JSON.stringify(certifications));

        // Add languages
        const languages = [];
        document.querySelectorAll('.language-item').forEach(item => {
            languages.push({
                language: item.querySelector('.language-name').value,
                proficiency: item.querySelector('.language-proficiency').value
            });
        });
        formData.append('languages', JSON.stringify(languages));

        // Add availability
        const availability = [];
        document.querySelectorAll('.availability-item').forEach(item => {
            availability.push({
                day: item.querySelector('.availability-day').value,
                startTime: item.querySelector('.availability-start').value,
                endTime: item.querySelector('.availability-end').value
            });
        });
        formData.append('availability', JSON.stringify(availability));

        // Add payment methods
        const paymentMethods = Array.from(document.querySelectorAll('input[name="paymentMethods"]:checked'))
            .map(checkbox => checkbox.value);
        formData.append('paymentMethods', JSON.stringify(paymentMethods));

        // Add social media
        const socialMedia = {
            linkedin: document.getElementById('linkedin').value,
            twitter: document.getElementById('twitter').value,
            instagram: document.getElementById('instagram').value,
            facebook: document.getElementById('facebook').value,
            website: document.getElementById('website').value
        };
        formData.append('socialMedia', JSON.stringify(socialMedia));

        // Send the form data
        const response = await fetch('/api/experts/apply', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Application submitted successfully!', 'success');
            this.reset();
            document.getElementById('profilePreview').style.display = 'none';
            document.querySelector('.upload-placeholder').style.display = 'block';
        } else {
            throw new Error(data.message || 'Failed to submit application');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'An error occurred while submitting the application', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});

// Real-time validation for input fields
document.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', function() {
        const errors = validateForm();
        const fieldErrors = errors.filter(error => 
            error.toLowerCase().includes(this.id.toLowerCase()) || 
            error.toLowerCase().includes(this.name.toLowerCase())
        );
        
        if (fieldErrors.length > 0) {
            this.classList.add('error');
            if (!this.nextElementSibling || !this.nextElementSibling.classList.contains('error-message')) {
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = fieldErrors[0];
                this.parentNode.insertBefore(errorMessage, this.nextSibling);
            }
        } else {
            this.classList.remove('error');
            const errorMessage = this.nextElementSibling;
            if (errorMessage && errorMessage.classList.contains('error-message')) {
                errorMessage.remove();
            }
        }
    });
}); 