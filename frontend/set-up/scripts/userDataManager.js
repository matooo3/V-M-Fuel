// userDataManager.js
// ==============================
// ===== USER DATA MANAGEMENT ===
// ==============================

import { getUserData, saveUserData } from './storage.js';

/**
 * Update specific field in user data
 * @param {string} key - The key (e.g. 'age', 'weight', 'height')
 * @param {any} value - The value to store
 * @returns {Object} Updated user data
 */
function updateUserData(key, value) {
    const userData = getUserData();
    userData[key] = value;
    saveUserData(userData);
    return userData;
}

/**
 * Get specific field from user data
 * @param {string} key - The key
 * @returns {any} The value or null if not found
 */
function getUserValue(key) {
    const userData = getUserData();
    return userData[key] || null;
}

/**
 * Clear all user data
 */
function clearUserData() {
    saveUserData({});
    console.log('User data cleared');
}

/**
 * Check if all required data is complete
 * @returns {boolean} True if all required fields exist
 */
function isUserDataComplete() {
    const userData = getUserData();
    const requiredFields = ['gender', 'age', 'weight', 'height', 'activity-level', 'goal'];
    return requiredFields.every(field => userData.hasOwnProperty(field));
}

/**
 * Get formatted summary of user data
 * @returns {Object} Formatted summary
 */
function getUserDataSummary() {
    const userData = getUserData();
    return {
        gender: userData.gender || 'Not selected',
        age: userData.age ? `${userData.age.ageYears} years old (${userData.age.formatted})` : 'Not selected',
        weight: userData.weight ? userData.weight.formatted : 'Not selected',
        height: userData.height ? userData.height.formatted : 'Not selected',
        activityLevel: userData['activity-level'] || 'Not selected',
        goal: userData.goal || 'Not selected',
        isComplete: isUserDataComplete()
    };
}

export const UserDataManager = {
    getUserData,
    saveUserData,
    updateUserData,
    getUserValue,
    clearUserData,
    isUserDataComplete,
    getUserDataSummary
};