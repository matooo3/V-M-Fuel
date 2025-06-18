// connect pages in the onboarding flow
const pages = [
  'getstarted.html', 
  ['gender.html', 'log-in.html'], // Branch: gender or login
  'age.html', 
  'weight.html', 
  'height.html', 
  'activity-level.html',
  'goal.html', 
  'account.html',
];

let cardDataArray = [];

window.cardDataArray = cardDataArray; // Make it globally accessible

// Store the previous page when navigating to login
function storePreviousPage() {
    const currentFile = window.location.pathname.split('/').pop();
    sessionStorage.setItem('previousPage', currentFile);
}

// Get the stored previous page
function getPreviousPage() {
    return sessionStorage.getItem('previousPage');
}

// Clear stored previous page
function clearPreviousPage() {
    sessionStorage.removeItem('previousePage');
}

// Get current page from URL
function getCurrentPageIndex() {
    const currentFile = window.location.pathname.split('/').pop();
    
    // Check if current file is in the pages array
    for (let i = 0; i < pages.length; i++) {
        if (Array.isArray(pages[i])) {
            // Check if current file is in the branch array
            if (pages[i].includes(currentFile)) {
                return i;
            }
        } else if (pages[i] === currentFile) {
            return i;
        }
    }
    
    return 0; // Default to first page if not found
}

// Get the next page based on current page and user choice
function getNextPage(currentIndex) {
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= pages.length) {
        return '../../index.html'; // End of flow
    }
    
    const nextPage = pages[nextIndex];
    
    // If next page is an array, return the first option (default path)
    if (Array.isArray(nextPage)) {
        return `../pages/${nextPage[0]}`;
    }
    
    return `../pages/${nextPage}`;
}

// Get the previous page for normal navigation
function getPreviousPageNormal(currentIndex) {
    const prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
        return null; // No previous page
    }
    
    const prevPage = pages[prevIndex];
    
    // If previous page is an array, we need to determine which one to go back to
    // For now, go to the first option
    if (Array.isArray(prevPage)) {
        return `../pages/${prevPage[0]}`;
    }
    
    return `../pages/${prevPage}`;
}

// Initialize navigation
function initNavigation() {
    const currentIndex = getCurrentPageIndex();
    const currentFile = window.location.pathname.split('/').pop();
    const nextBtn = document.querySelector('.next-btn');
    const backArrow = document.querySelector('.arrow-back');
    const loginBtn = document.querySelector('.login-btn');

    // Handle login span (on all pages except getstarted.html)
    if(currentFile !== 'getstarted.html') {
        // Event listener for log in in the footer section
        const text_log_in = document.querySelector('.log-in');
        
        if (text_log_in) {
            text_log_in.addEventListener('click', function() {
                // Store current page before navigating to login
                storePreviousPage();
                window.location.href = '../pages/log-in.html';
            });
        }
    }

    if(currentFile === 'log-in.html') {
        const reset = document.querySelector('.reset');
        
        if (reset) {
            reset.addEventListener('click', function() {
                // 1. Only replace the personal-data-div content
                const personalDataDiv = document.getElementById('personal-data-div');
                if (personalDataDiv) {
                    personalDataDiv.innerHTML = `
                        <h1 id="reset-title">Reset Password</h1>
                        <div class="data">
                            <input type="email" placeholder="Enter your email address" id="reset-email">
                        </div>
                    `;
                }

                // Transform the email div to just a horizontal line
                const emailDiv = document.querySelector('.email');
                if (emailDiv) {
                    emailDiv.style.height = emailDiv.offsetHeight + 'px';
                    emailDiv.style.display = 'flex';
                    emailDiv.style.alignItems = 'center';
                    emailDiv.style.justifyContent = 'center';
                    emailDiv.innerHTML = '<div id="reset-line"></div>';
                }

                // Change the next button to "Send Reset Link"
                const nextBtn = document.querySelector('.next-btn');
                if (nextBtn) {
                    // Clone the button to remove all event listeners
                    const newBtn = nextBtn.cloneNode(true);
                    nextBtn.parentNode.replaceChild(newBtn, nextBtn);
                    
                    // Now configure the new button
                    newBtn.textContent = 'Send Reset Link';
                    newBtn.className = 'reset-btn';
                    
                    // Add the reset functionality
                    newBtn.addEventListener('click', function() {
                        const emailInput = document.getElementById('reset-email');
                        const email = emailInput.value.trim();
                        
                        if (email && email.includes('@')) {
                            // Show success message in personal-data-div
                            personalDataDiv.innerHTML = `
                                <div class="reset-success">
                                    <h2>Email Sent!</h2>
                                    <p>We've sent a password reset link to <strong>${email}</strong></p>
                                    <p>Please check your email and follow the instructions to reset your password.</p>
                                </div>
                            `;
                            
                            // Change button to "Back to Login"
                            newBtn.textContent = 'Back to Login';
                            newBtn.className = 'back-to-login-btn';
                            
                            // Remove old event listener and add new one
                            const finalBtn = newBtn.cloneNode(true);
                            newBtn.parentNode.replaceChild(finalBtn, newBtn);
                            
                            // Add back to login functionality to the new button
                            finalBtn.addEventListener('click', function() {
                                window.location.reload();
                            });
                            
                            // Update footer text
                            const footerText = document.getElementById('footer-text');
                            if (footerText) {
                                footerText.innerHTML = 'Email sent successfully!';
                            }
                            
                        } else {
                            // Show error message
                            emailInput.style.borderColor = 'red';
                            emailInput.style.backgroundColor = '#ffe6e6';
                            emailInput.placeholder = 'Please enter a valid email address';
                            emailInput.value = '';
                        }
                    });
                }

                const backArrow = document.querySelector('.arrow-back');
                if (backArrow) {
                    // Hide the back arrow on reset page
                    backArrow.style.display = 'none';
                }
                
                // Update the footer text
                const footerText = document.getElementById('footer-text');
                if (footerText) {
                    footerText.innerHTML = 'Remember your password? <span class="accent-col login-link">Back to Login</span>';
                }
                
                // Add functionality to "Back to Login" link in footer
                const loginLink = document.querySelector('.login-link');
                if (loginLink) {
                    loginLink.addEventListener('click', function() {
                        // Reload the page to restore original login form
                        window.location.reload();
                    });
                }
            });
        }
    }

    // Handle login button (specific to getstarted.html)
    if (loginBtn && currentFile === 'getstarted.html') {
        loginBtn.addEventListener('click', function() {
            // Store getstarted as previous page
            storePreviousPage();
            window.location.href = '../pages/log-in.html';
        });
    }

    function getCardInfo(){
        const selectedCard = document.querySelector('.card.clicked');
        
        if (selectedCard) {
            // Get the data attributes from the selected card
            const cardData = selectedCard.textContent.trim();
            
            cardDataArray.push(cardData); // Store card data in array

        }
        
        return null; // No card selected
    }
    
    // Configure next button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {

            const pagesWithCards = ['goal.html', 'activity-level.html', 'gender.html'];

            if (pagesWithCards.includes(currentFile)) {
                
                getCardInfo(); // Get selected card info
                
            }

            if (currentIndex === pages.length - 1) {
                // Last page - go to main index
                clearPreviousPage(); // Clear stored page when completing flow
                window.location.href = '../../index.html'; //password needs to be set up

            } else {
                // Special handling for getstarted.html - default to gender.html
                if (currentFile === 'getstarted.html') {
                    clearPreviousPage(); // Clear any stored previous page
                    window.location.href = '../pages/gender.html';

                } else if (currentFile === 'log-in.html') {
                    // Validate login credentials before proceeding
                    const emailInput = document.querySelector('input[type="email"]');
                    const passwordInput = document.querySelector('input[type="password"]');
                    
                    const email = emailInput.value.trim();
                    const password = passwordInput.value.trim();
                    
                    // Reset previous error styles
                    emailInput.style.borderColor = '';
                    passwordInput.style.borderColor = '';
                    emailInput.style.backgroundColor = '';
                    passwordInput.style.backgroundColor = '';
                    
                    let isValid = true;
                    
                    // Email validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!email) {
                        emailInput.style.borderColor = 'red';
                        emailInput.style.backgroundColor = '#ffe6e6';
                        emailInput.placeholder = 'Email is required';
                        isValid = false;
                    } else if (!emailRegex.test(email)) {
                        emailInput.style.borderColor = 'red';
                        emailInput.style.backgroundColor = '#ffe6e6';
                        emailInput.value = '';
                        emailInput.placeholder = 'Please enter a valid email address';
                        isValid = false;
                    }
                    
                    // Password validation
                    if (!password) {
                        passwordInput.style.borderColor = 'red';
                        passwordInput.style.backgroundColor = '#ffe6e6';
                        passwordInput.placeholder = 'Password is required';
                        isValid = false;
                    } else if (password.length < 6) {
                        passwordInput.style.borderColor = 'red';
                        passwordInput.style.backgroundColor = '#ffe6e6';
                        passwordInput.value = '';
                        passwordInput.placeholder = 'Password must be at least 6 characters';
                        isValid = false;
                    }
                    
                    // If validation passes, proceed to next page
                    if (isValid) {
                        // Here you would typically validate against a database
                        // For demo purposes, we'll accept any valid email/password combo
                        // You can add specific email/password combinations for testing:
                        
                        // Example: Check for demo credentials
                        if (email === 'demo@example.com' && password === 'password123') {
                            clearPreviousPage(); // Clear stored page after login
                            window.location.href = '../../index.html';
                        } else {
                            // For demo, accept any valid format for now
                            // In production, this would make an API call to verify credentials
                            clearPreviousPage(); // Clear stored page after login
                            window.location.href = '../../index.html';
                        }
                    }

                } else {
                    // Normal flow
                    const nextPage = getNextPage(currentIndex);
                    window.location.href = nextPage;
                }
            }
        });
    }
    
    // Configure back arrow
    if (backArrow) {
        if (currentIndex > 0 || currentFile === 'log-in.html') {
            backArrow.style.display = 'block';
            backArrow.style.cursor = 'pointer';
            
            backArrow.addEventListener('click', function() {
                
                if (currentFile === 'log-in.html') {
                    // Go back to the page that led to login
                    const previousPage = getPreviousPage();
                    
                    if (previousPage && previousPage !== 'log-in.html') {
                        clearPreviousPage(); // Clear after using
                        window.location.href = `../pages/${previousPage}`;
                    } else {
                        // Fallback to getstarted if no previous page stored
                        window.location.href = '../pages/getstarted.html';
                    }
                    
                } else if (currentFile === 'age.html') {
                    // Age can come from gender or log-in, default back to gender
                    window.location.href = '../pages/gender.html';
                    
                } else {
                    // Normal flow
                    const prevPage = getPreviousPageNormal(currentIndex);
                    if (prevPage) {
                        window.location.href = prevPage;
                    }
                }
            });
        } 
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', initNavigation);

// Event listener for card selection
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    card.addEventListener('click', function() {
        // Remove selected class from all cards
        cards.forEach(c => c.classList.remove('clicked'));
        
        // Add selected class to clicked card
        this.classList.add('clicked');
    });
});