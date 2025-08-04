// accountFormManager.js
// ==============================
// ===== ACCOUNT FORM FUNCTIONS =====
// ==============================

import { getUserDataFromLS, saveUserDataToLS } from './storage.js';


/**
 * Initialize account form functionality
 */
function initializeAccountForm() {
    loadFormDataFromStorage();
    setupFormAutoSave();
    setupLinkAutoSave();
}

/**
 * Load form data from Local Storage
 */
function loadFormDataFromStorage() {
    const userData = getUserDataFromLS();
    
    // Load username
    const usernameField = document.getElementById('username');
    if (usernameField && userData.username) {
        usernameField.value = userData.username;
    }
    
    // Load email
    const emailField = document.getElementById('email');
    if (emailField && userData.email) {
        emailField.value = userData.email;
    }
    
    // Load password (optional - for better UX during setup)
    const passwordField = document.getElementById('password');
    if (passwordField && userData.password) {
        passwordField.value = userData.password;
    }
    
    // Load terms acceptance
    const termsCheckbox = document.getElementById('acceptTerms');
    if (termsCheckbox && userData.acceptTerms) {
        termsCheckbox.checked = userData.acceptTerms;
    }
    
    console.log('Loaded account form data from storage:', {
        username: userData.username || 'not set',
        email: userData.email || 'not set',
        termsAccepted: userData.acceptTerms || false
    });
}

/**
 * Save current form data to Local Storage
 */
function saveFormDataToStorage() {
    const userData = getUserDataFromLS();
    
    // Get form field values
    const usernameField = document.getElementById('username');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const termsCheckbox = document.getElementById('acceptTerms');
    
    // Save to userData object
    if (usernameField) {
        userData.username = usernameField.value.trim();
    }
    
    if (emailField) {
        userData.email = emailField.value.trim();
    }
    
    if (passwordField) {
        userData.password = passwordField.value; // Keep password for setup flow
    }
    
    if (termsCheckbox) {
        userData.acceptTerms = termsCheckbox.checked;
    }
    
    // Save to Local Storage
    saveUserDataToLS(userData);
    
    console.log('Saved account form data to storage:', {
        username: userData.username,
        email: userData.email,
        termsAccepted: userData.acceptTerms
    });
    
    return userData;
}

/**
 * Setup auto-save on form input changes
 */
function setupFormAutoSave() {
    const formFields = ['username', 'email', 'password'];
    const termsCheckbox = document.getElementById('acceptTerms');
    
    // Auto-save on input change for text fields
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            // Save on blur (when field loses focus)
            field.addEventListener('blur', () => {
                saveFormDataToStorage();
            });
            
            // Save on input change (with debounce)
            let timeout;
            field.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    saveFormDataToStorage();
                }, 500); // Wait 500ms after user stops typing
            });
        }
    });
    
    // Auto-save on checkbox change
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', () => {
            saveFormDataToStorage();
        });
    }
}

/**
 * Setup auto-save when clicking on external links
 */
function setupLinkAutoSave() {
    // Save when clicking on Terms of Use link
    const termsLink = document.querySelector('a[href="./terms-of-use.html"]');
    if (termsLink) {
        termsLink.addEventListener('click', () => {
            saveFormDataToStorage();
        });
    }
    
    // Save when clicking on Privacy Policy link
    const privacyLink = document.querySelector('a[href="privacy-policy.html"]');
    if (privacyLink) {
        privacyLink.addEventListener('click', () => {
            saveFormDataToStorage();
        });
    }
    
    // Save when clicking on login link
    const loginLink = document.querySelector('.log-in');
    if (loginLink) {
        loginLink.addEventListener('click', () => {
            saveFormDataToStorage();
        });
    }
}

/**
 * Get current form data
 * @returns {Object} Current form data
 */
function getCurrentFormData() {
    return {
        username: document.getElementById('username')?.value?.trim() || '',
        email: document.getElementById('email')?.value?.trim() || '',
        password: document.getElementById('password')?.value || '',
        acceptTerms: document.getElementById('acceptTerms')?.checked || false
    };
}

/**
 * Validate form data
 * @returns {Object} Validation result
 */
function validateFormData() {
    const formData = getCurrentFormData();
    const errors = [];
    
    if (!formData.username) {
        errors.push('Username is required');
    }
    
    if (!formData.email) {
        errors.push('Email is required');
    } else if (!formData.email.includes('@')) {
        errors.push('Please enter a valid email');
    }
    
    if (!formData.password) {
        errors.push('Password is required');
    } else if (formData.password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    
    if (!formData.acceptTerms) {
        errors.push('You must accept the Terms of Use');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        data: formData
    };
}

export const AccountFormManager = {
    initializeAccountForm,
    loadFormDataFromStorage,
    saveFormDataToStorage,
    setupFormAutoSave,
    setupLinkAutoSave,
    getCurrentFormData,
    validateFormData
};