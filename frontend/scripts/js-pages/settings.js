// ==============================
// ======= CARD ELEMENTS ========
// ==============================

// Event listener for card selection
const cards = document.querySelectorAll('.card-st-activity');

cards.forEach(card => {
    card.addEventListener('click', function() {
        // Remove selected class from all cards
        cards.forEach(c => c.classList.remove('clicked-st-activity'));
        
        // Add selected class to clicked card
        this.classList.add('clicked-st-activity');
    });
});

// same with card-st-goal
const goalCards = document.querySelectorAll('.card-st-goal');

goalCards.forEach(card => {
    card.addEventListener('click', function() {
        // Remove selected class from all cards
        goalCards.forEach(c => c.classList.remove('clicked-st-goal'));

        // Add selected class to clicked card
        this.classList.add('clicked-st-goal');
    });
});
