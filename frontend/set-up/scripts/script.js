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

// Get the previous page
function getPreviousPage(currentIndex) {
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

    // Handle login button (specific to getstarted.html)
    if (loginBtn && currentFile === 'getstarted.html') {
        loginBtn.addEventListener('click', function() {
            window.location.href = '../pages/log-in.html';
        });
    }
    
    // Configure next button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {

            if (currentIndex === pages.length - 1) {
                // Last page - go to main index

                window.location.href = '../../index.html'; //password needs to be set up

            } else {
                // Special handling for getstarted.html - default to gender.html
                if (currentFile === 'getstarted.html') {
                    window.location.href = '../pages/gender.html';

                } else if (currentFile === 'log-in.html') {

                    // After login, go directly to index.html
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
        if (currentIndex > 0) {
            backArrow.style.display = 'block';
            backArrow.style.cursor = 'pointer';
            backArrow.addEventListener('click', function() {
                // Special handling for pages that can come from multiple sources
                if (currentFile === 'age.html') {
                    // Age can come from gender or log-in, default back to gender
                    window.location.href = '../pages/gender.html';
                } else {
                    const prevPage = getPreviousPage(currentIndex);
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

