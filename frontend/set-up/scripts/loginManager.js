// loginManager.js
// ==============================
// ===== LOGIN FUNCTIONS =====
// ==============================

import { Utils } from './utils.js';
import { NavigationManager } from './navigationManager.js';

/**
 * Initialize all login-related event listeners
 */
function initializeLoginEvents() {
    const currentFile = Utils.getCurrentFile();
    
    // Handle login link in footer (excluding getstarted.html)
    if (currentFile !== 'getstarted.html') {
        const textLogIn = document.querySelector('.log-in');
        if (textLogIn) {
            textLogIn.addEventListener('click', () => {
                NavigationManager.storePreviousPage();
                window.location.href = '../pages/log-in.html';
            });
        }
    }

    // Handle login button on getstarted.html
    if (currentFile === 'getstarted.html') {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                NavigationManager.storePreviousPage();
                window.location.href = '../pages/log-in.html';
            });
        }
    }

    // Handle reset password functionality
    if (currentFile === 'log-in.html') {
        initializeResetPassword();
    }
}

/**
 * Initialize reset password functionality
 */
function initializeResetPassword() {
    const reset = document.querySelector('.reset');
    if (!reset) return;

    reset.addEventListener('click', () => {
        showResetPasswordForm();
    });
}

/**
 * Show reset password form
 */
function showResetPasswordForm() {
    const personalDataDiv = document.getElementById('login-form');
    if (personalDataDiv) {
        personalDataDiv.innerHTML = `
            <form>
                <input class="data" type="email" placeholder="Enter your email address" id="reset-email">
            </form>
        `;
    }

    const emailText = document.getElementById('email-text');
    if (emailText) {
        emailText.textContent = 'Or reset password';
    }

    setupResetButton();
    hideBackArrow();
    updateFooterForReset();
}

/**
 * Setup reset button functionality
 */
function setupResetButton() {
    const nextBtn = document.querySelector('.next-btn');
    if (!nextBtn) return;

    const newBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newBtn, nextBtn);

    newBtn.textContent = 'Send reset link';
    newBtn.className = 'reset-btn';

    newBtn.addEventListener('click', () => {
        handleResetSubmission();
    });
}

/**
 * Handle reset form submission
 */
function handleResetSubmission() {
    const emailInput = document.getElementById('reset-email');
    const email = emailInput.value.trim();

    if (email && email.includes('@')) {
        showResetSuccess();
    } else {
        showResetError(emailInput);
    }
}

/**
 * Show reset success message
 */
function showResetSuccess() {
    const personalDataDiv = document.getElementById('login-form');
    if (personalDataDiv) {
        personalDataDiv.innerHTML = `
            <div class="login-form">
                <div class="sign-up"> 
                    <img src="../pictures/email logo.svg" alt="email-logo" id="email-logo"/>
                    <h1 id="sign-up-text">Email sent!</h1>
                </div>
            </div>
        `;
    }

    setupBackToLoginButton();
    updateFooterSuccess();
}

/**
 * Show reset error message
 * @param {HTMLElement} emailInput - Email input element
 */
function showResetError(emailInput) {
    emailInput.style.borderColor = 'red';
    emailInput.style.backgroundColor = '#ffe6e6';
    emailInput.placeholder = 'Please enter a valid email';
    emailInput.value = '';
}

/**
 * Setup back to login button
 */
function setupBackToLoginButton() {
    const resetBtn = document.querySelector('.reset-btn');
    if (!resetBtn) return;

    resetBtn.textContent = 'Back to Login';
    const finalBtn = resetBtn.cloneNode(true);
    resetBtn.parentNode.replaceChild(finalBtn, resetBtn);

    finalBtn.addEventListener('click', () => {
        window.location.reload();
    });
}

/**
 * Hide back arrow during reset flow
 */
function hideBackArrow() {
    const backArrow = document.querySelector('.arrow-back');
    if (backArrow) {
        backArrow.style.display = 'none';
    }
}

/**
 * Update footer for reset password flow
 */
function updateFooterForReset() {
    const footerText = document.getElementById('footer-text');
    if (footerText) {
        footerText.innerHTML = 'Remember your password? <span class="accent-col login-link">Back to Login</span>';
        
        const loginLink = document.querySelector('.login-link');
        if (loginLink) {
            loginLink.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }
}

/**
 * Update footer for success message
 */
function updateFooterSuccess() {
    const footerText = document.getElementById('footer-text');
    if (footerText) {
        footerText.innerHTML = 'Please check your email!';
    }
}

export const LoginManager = {
    initializeLoginEvents,
    initializeResetPassword,
    showResetPasswordForm,
    setupResetButton,
    handleResetSubmission,
    showResetSuccess,
    showResetError,
    setupBackToLoginButton,
    hideBackArrow,
    updateFooterForReset,
    updateFooterSuccess
};