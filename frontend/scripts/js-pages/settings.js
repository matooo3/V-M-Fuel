// ==============================
// ======= CARD ELEMENTS ========
// ==============================

// Event listener for card selection
const cards = document.querySelectorAll('.card-st');

cards.forEach(card => {
    card.addEventListener('click', function() {
        // Remove selected class from all cards
        cards.forEach(c => c.classList.remove('clicked-st'));
        
        // Add selected class to clicked card
        this.classList.add('clicked-st');
    });
});