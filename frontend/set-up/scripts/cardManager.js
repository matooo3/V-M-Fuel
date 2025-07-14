// cardManager.js
// ==============================
// ===== CARD FUNCTIONS =====
// ==============================

import { getUserData, saveUserData } from '../../scripts/storage.js';

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
    cards.forEach(card => {
        card.addEventListener('click', handleCardClick);
    });
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

    // Spezielle Behandlung für activity-level.html
    let value;
    if (currentFile === 'activity-level.html') {
        const alTextElement = selectedCard.querySelector('.al-text');
        value = alTextElement ? alTextElement.textContent.trim() : selectedCard.textContent.trim();
    } else {
        value = selectedCard.textContent.trim();
    }

    const userData = getUserData();
    userData[key] = value;
    saveUserData(userData);
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