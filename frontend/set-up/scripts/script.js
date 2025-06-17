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
    sessionStorage.removeItem('previousPage');
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

    // Handle login button (specific to getstarted.html)
    if (loginBtn && currentFile === 'getstarted.html') {
        loginBtn.addEventListener('click', function() {
            // Store getstarted as previous page
            storePreviousPage();
            window.location.href = '../pages/log-in.html';
        });
    }
    
    // Configure next button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {

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
                    // After login, go directly to index.html
                    clearPreviousPage(); // Clear stored page after login
                    window.location.href = '../../index.html';
                    // log in data needs to be correct

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
        } else {
            // First page - hide back arrow
            backArrow.style.display = 'none';
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