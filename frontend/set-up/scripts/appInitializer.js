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
    
    // Add auto-save functionality for all navigation actions
    setupAutoSave(currentFile);
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
 * Setup auto-save functionality for all navigation actions
 * @param {string} currentFile - Current filename
 */
function setupAutoSave(currentFile) {
    // Auto-save before page unload (browser back, refresh, close)
    window.addEventListener('beforeunload', () => {
        saveCurrentPageData(currentFile);
    });
    
    // Auto-save on visibility change (tab switch, minimize)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            saveCurrentPageData(currentFile);
        }
    });
    
    // Auto-save when clicking login links
    setupLoginAutoSave(currentFile);
}

/**
 * Setup auto-save for login navigation
 * @param {string} currentFile - Current filename
 */
function setupLoginAutoSave(currentFile) {
    // Handle login link in footer (excluding getstarted.html)
    if (currentFile !== 'getstarted.html') {
        const textLogIn = document.querySelector('.log-in');
        if (textLogIn) {
            textLogIn.addEventListener('click', () => {
                saveCurrentPageData(currentFile);
            });
        }
    }

    // Handle login button on getstarted.html
    if (currentFile === 'getstarted.html') {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                saveCurrentPageData(currentFile);
            });
        }
    }
}

/**
 * Save current page data based on page type
 * @param {string} currentFile - Current filename
 */
function saveCurrentPageData(currentFile) {
    try {
        // Save picker data if applicable
        if (pickerInstance) {
            const pickerType = currentFile.replace('.html', '');
            const result = PickerFactory.savePickerData(pickerType, pickerInstance);
            if (result) {
                console.log(`Auto-saved ${pickerType} data:`, result);
            }
        }

        // Save card data if applicable
        const pagesWithCards = ['goal.html', 'activity-level.html', 'gender.html'];
        if (pagesWithCards.includes(currentFile)) {
            const result = CardManager.saveCardData(currentFile);
            if (result) {
                console.log(`Auto-saved card data for ${currentFile}:`, result);
            }
        }
    } catch (error) {
        console.error('Error auto-saving data:', error);
    }
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
    // Save current page data
    saveCurrentPageData(currentFile);

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
            // Save current page data before navigating back
            saveCurrentPageData(currentFile);
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
    handleNextButtonClick,
    setupAutoSave,
    saveCurrentPageData
};

// ==============================
// ===== AUTO-INITIALIZATION ===
// ==============================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AppInitializer.init();
});