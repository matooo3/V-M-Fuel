// cardManager.js
// ==============================
// ===== CARD FUNCTIONS =====
// ==============================

import { getUserDataFromLS, saveUserDataToLS } from './modules/storage.js';
import { Utils } from './utils.js';

const PAGE_KEY_MAP = {
    'goal.html': 'goal',
    'activity-level.html': 'activityLevel',
    'gender.html': 'gender'
};


/**
 * Initialize card event listeners
 */
function initializeCards() {
    const cards = document.querySelectorAll('.card');
    // If there are no cards on the page, exit the function.
    if (cards.length === 0) return;

    cards.forEach(card => {
        card.addEventListener('click', handleCardClick);
    });

    const currentFile = Utils.getCurrentFile();
    const key = PAGE_KEY_MAP[currentFile];
    if (!key) return; // Not a page with selectable cards

    const userData = getUserDataFromLS();
    const storedValue = userData[key];
    let cardWasSelected = false;

    // Try to select a card based on Local Storage data
    if (storedValue) {
        for (const card of cards) {
            let cardValue;
            // Handle specific text extraction for activity-level.html
            if (currentFile === 'activity-level.html') {
                const alTextElement = card.querySelector('.al-text');
                cardValue = alTextElement ? alTextElement.textContent.trim() : card.textContent.trim();
            } else {
                cardValue = card.textContent.trim();
            }

            if (cardValue === storedValue) {
                card.classList.add('clicked');
                cardWasSelected = true;
                break; // Exit loop once the selected card is found
            }
        }
    }

    // If no card was selected from storage, select the first one by default
    if (!cardWasSelected) {
        cards[0].classList.add('clicked');
    }
}

/**
 * Handle card click event
 * @param {Event} event - Click event
 */
function handleCardClick(event) {
    const cards = document.querySelectorAll('.card');
    // Remove selected class from all cards
    cards.forEach(c => c.classList.remove('clicked'));
    // Add selected class to clicked card
    event.currentTarget.classList.add('clicked');
}

/**
 * Save card selection data
 * @param {string} currentFile - Current page filename
 * @returns {Object|null} Updated user data or null
 */

function saveCardData(currentFile) {
    const selectedCard = document.querySelector('.card.clicked');
    
    if (!selectedCard) return null;

    const key = PAGE_KEY_MAP[currentFile];
    if (!key) return null;

    let value;
    if (currentFile === 'activity-level.html') {
        const alTextElement = selectedCard.querySelector('.al-text');
        value = alTextElement ? alTextElement.textContent.trim() : selectedCard.textContent.trim();
    } else {
        value = selectedCard.textContent.trim();
    }

    const userData = getUserDataFromLS();
    userData[key] = value;
    saveUserDataToLS(userData);
    return userData;
}

/**
 * Get currently selected card element
 * @returns {Element|null} Selected card element
 */
function getSelectedCard() {
    return document.querySelector('.card.clicked');
}

export const CardManager = {
    initializeCards,
    handleCardClick,
    saveCardData,
    getSelectedCard
};