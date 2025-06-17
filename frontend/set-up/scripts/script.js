// connect pages in the onboarding flow
const pages = [
  'getstarted.html', 
  'gender.html', 
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
    const index = pages.findIndex(page => page === currentFile);
    return index !== -1 ? index : 0; // Default to first page if not found
}

// Initialize navigation
function initNavigation() {
    const currentIndex = getCurrentPageIndex();
    const nextBtn = document.querySelector('.next-btn');
    const backArrow = document.querySelector('.arrow-back');
    
    // Configure next button
    if (nextBtn) {
        if (currentIndex < pages.length) {
            nextBtn.addEventListener('click', function() {

            if (currentIndex === pages.length - 1) {

                window.location.href = `../../index.html`;

              } else {

                window.location.href = `../pages/${pages[currentIndex + 1]}`;

              }
            });
    }
  }
    
    // Configure back arrow
    if (backArrow) {
        if (currentIndex > 0) {
            backArrow.addEventListener('click', function() {
              window.location.href = `../pages/${pages[currentIndex - 1]}`;
            });
    }
}

}

// Run when page loads
document.addEventListener('DOMContentLoaded', initNavigation);

// event listener for card selection
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    card.addEventListener('click', function() {
        // Remove selected class from all cards
        cards.forEach(c => c.classList.remove('clicked'));
        
        // Add selected class to clicked card
        this.classList.add('clicked');
        
    });
});