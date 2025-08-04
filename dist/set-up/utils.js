// utils.js
// ==============================
// ===== UTILITY FUNCTIONS =====
// ==============================

/**
 * Get current filename from URL
 * @returns {string} Current filename
 */
function getCurrentFile() {
    return window.location.pathname.split('/').pop();
}

/**
 * Calculate age from birth date
 * @param {Date} birthDate - Birth date
 * @returns {number} Age in years
 */
function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export const Utils = {
    getCurrentFile,
    calculateAge
};