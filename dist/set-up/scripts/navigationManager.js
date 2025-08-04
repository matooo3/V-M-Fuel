// navigationManager.js
// ==============================
// ===== NAVIGATION FUNCTIONS ===
// ==============================

import { Utils } from './utils.js';
import { getUserDataFromLS } from '../../scripts/storage.js';

const PAGES = [
    'getstarted.html',
    ['gender.html', 'log-in.html'], // Branch: gender or login
    'age.html',
    'weight.html',
    'height.html',
    'activity-level.html',
    'goal.html',
    'account.html',
];

// ==============================
// ===== SESSION STORAGE FOR NAVIGATION =====
// ==============================

/**
 * Store previous page for login flow
 */
function storePreviousPage() {
    const currentFile = Utils.getCurrentFile();
    sessionStorage.setItem('previousPage', currentFile);
}

/**
 * Get stored previous page
 * @returns {string|null} Previous page or null
 */
function getPreviousPage() {
    return sessionStorage.getItem('previousPage');
}

/**
 * Clear stored previous page
 */
function clearPreviousPage() {
    sessionStorage.removeItem('previousPage');
}

// ==============================
// ===== PAGE NAVIGATION LOGIC =====
// ==============================

/**
 * Get current page index in flow
 * @returns {number} Current page index
 */
function getCurrentPageIndex() {
    const currentFile = Utils.getCurrentFile();

    for (let i = 0; i < PAGES.length; i++) {
        if (Array.isArray(PAGES[i])) {
            if (PAGES[i].includes(currentFile)) {
                return i;
            }
        } else if (PAGES[i] === currentFile) {
            return i;
        }
    }
    return 0; // Default to first page if not found
}

/**
 * Get next page URL
 * @param {number} currentIndex - Current page index
 * @returns {string} Next page URL
 */
function getNextPage(currentIndex) {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= PAGES.length) {
        return '../../index.html'; // End of flow
    }

    const nextPage = PAGES[nextIndex];

    if (Array.isArray(nextPage)) {
        return `../pages/${nextPage[0]}`;
    }

    return `../pages/${nextPage}`;
}

/**
 * Get previous page URL for normal navigation
 * @param {number} currentIndex - Current page index
 * @returns {string|null} Previous page URL or null
 */
function getPreviousPageNormal(currentIndex) {
    const prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
        return null; // No previous page
    }

    const prevPage = PAGES[prevIndex];

    if (Array.isArray(prevPage)) {
        return `../pages/${prevPage[0]}`;
    }

    return `../pages/${prevPage}`;
}

/**
 * Navigate to next page in flow
 * @param {number} currentIndex - Current page index
 * @param {string} currentFile - Current filename
 */
function navigateToNext(currentIndex, currentFile) {
    if (currentIndex === PAGES.length - 1) {
        // Last page - go to main index
        clearPreviousPage();
        console.log('Complete user data:', getUserDataFromLS());
        window.location.href = '../../index.html';
    } else {
        // Special handling for getstarted.html - default to gender.html
        if (currentFile === 'getstarted.html') {
            clearPreviousPage();
            window.location.href = '../pages/gender.html';
        } else if (currentFile === 'log-in.html') {
            // Add login validation here if needed
            const nextPage = getNextPage(currentIndex);
            window.location.href = nextPage;
        } else {
            // Normal flow
            const nextPage = getNextPage(currentIndex);
            window.location.href = nextPage;
        }
    }
}

/**
 * Navigate to previous page
 * @param {number} currentIndex - Current page index
 * @param {string} currentFile - Current filename
 */
function navigateToBack(currentIndex, currentFile) {
    if (currentFile === 'log-in.html') {
        const previousPage = getPreviousPage();
        if (previousPage && previousPage !== 'log-in.html') {
            clearPreviousPage();
            window.location.href = `../pages/${previousPage}`;
        } else {
            window.location.href = '../pages/getstarted.html';
        }
    } else if (currentFile === 'age.html') {
        window.location.href = '../pages/gender.html';
    } else {
        const prevPage = getPreviousPageNormal(currentIndex);
        if (prevPage) {
            window.location.href = prevPage;
        }
    }
}

export const NavigationManager = {
    storePreviousPage,
    getPreviousPage,
    clearPreviousPage,
    getCurrentPageIndex,
    getNextPage,
    getPreviousPageNormal,
    navigateToNext,
    navigateToBack
};