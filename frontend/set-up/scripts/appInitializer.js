// appInitializer.js
// ==============================
// ===== MAIN INITIALIZATION ===
// ==============================

import { Utils } from './utils.js';
import { PickerFactory } from './pickerFactory.js';
import { CardManager } from './cardManager.js';
import { NavigationManager } from './navigationManager.js';
import { LoginManager } from './loginManager.js';

let pickerInstance = null;

/**
 * Initialize the application
 */
function init() {
    const currentFile = Utils.getCurrentFile();
    
    initializePicker(currentFile);
    initializeNavigation();
    CardManager.initializeCards();
    LoginManager.initializeLoginEvents();
}

/**
 * Initialize picker based on current page
 * @param {string} currentFile - Current filename
 */
function initializePicker(currentFile) {
    if (currentFile === 'age.html') {
        pickerInstance = PickerFactory.createPicker('age');
    } else if (currentFile === 'height.html') {
        pickerInstance = PickerFactory.createPicker('height');
    } else if (currentFile === 'weight.html') {
        pickerInstance = PickerFactory.createPicker('weight');
    }
}

/**
 * Initialize navigation event listeners
 */
function initializeNavigation() {
    const currentIndex = NavigationManager.getCurrentPageIndex();
    const currentFile = Utils.getCurrentFile();
    
    setupNextButton(currentIndex, currentFile);
    setupBackButton(currentIndex, currentFile);
}

/**
 * Setup next button event listener
 * @param {number} currentIndex - Current page index
 * @param {string} currentFile - Current filename
 */
function setupNextButton(currentIndex, currentFile) {
    const nextBtn = document.querySelector('.next-btn');
    if (!nextBtn) return;

    nextBtn.addEventListener('click', () => {
        handleNextButtonClick(currentIndex, currentFile);
    });
}

/**
 * Handle next button click
 * @param {number} currentIndex - Current page index
 * @param {string} currentFile - Current filename
 */
function handleNextButtonClick(currentIndex, currentFile) {
    // Save picker data if applicable
    if (pickerInstance) {
        const pickerType = currentFile.replace('.html', '');
        PickerFactory.savePickerData(pickerType, pickerInstance);
    }

    // Save card data if applicable
    const pagesWithCards = ['goal.html', 'activity-level.html', 'gender.html'];
    if (pagesWithCards.includes(currentFile)) {
        const result = CardManager.saveCardData(currentFile);
        console.log('Updated user data:', result);
    }

    // Navigate to next page
    NavigationManager.navigateToNext(currentIndex, currentFile);
}

/**
 * Setup back button event listener
 * @param {number} currentIndex - Current page index
 * @param {string} currentFile - Current filename
 */
function setupBackButton(currentIndex, currentFile) {
    const backArrow = document.querySelector('.arrow-back');
    if (!backArrow) return;

    if (currentIndex > 0 || currentFile === 'log-in.html') {
        backArrow.style.display = 'block';
        backArrow.style.cursor = 'pointer';

        backArrow.addEventListener('click', () => {
            NavigationManager.navigateToBack(currentIndex, currentFile);
        });
    }
}

export const AppInitializer = {
    init,
    initializePicker,
    initializeNavigation,
    setupNextButton,
    setupBackButton,
    handleNextButtonClick
};

// ==============================
// ===== AUTO-INITIALIZATION ===
// ==============================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AppInitializer.init();
});