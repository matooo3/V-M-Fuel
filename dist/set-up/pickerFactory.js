// pickerFactory.js
// ==============================
// ===== PICKER FUNCTIONS =====
// ==============================

import { UniversalApplePicker } from './universalApplePicker.js';
import { getUserDataFromLS, saveUserDataToLS } from './storage.js';

/**
 * Create a picker instance
 * @param {string} type - Type of picker ('age', 'height', 'weight')
 * @param {Object} options - Optional configuration
 * @returns {UniversalApplePicker} Picker instance
 */
function createPicker(type, options = {}) {
    return new UniversalApplePicker(type, options);
}

/**
 * Save age data to storage
 * @param {Object} ageData - Age data from picker
 * @returns {Object} Updated user data
 */
function saveAgeData(ageData) {
    const userData = getUserDataFromLS();
    userData.age = ageData.age;
    userData.dateObject = {
            day: ageData.day,
            month: ageData.month,
            year: ageData.year
    };
    saveUserDataToLS(userData);
    return userData;
}

/**
 * Save weight data to storage
 * @param {Object} weightData - Weight data from picker
 * @returns {Object} Updated user data
 */
function saveWeightData(weightData) {
    const userData = getUserDataFromLS();
    userData.weight = {
        kg: weightData.kg,
        pounds: weightData.pounds,
        unit: weightData.unit
    };
    saveUserDataToLS(userData);
    return userData;
}

/**
 * Save height data to storage
 * @param {Object} heightData - Height data from picker
 * @returns {Object} Updated user data
 */
function saveHeightData(heightData) {
    const userData = getUserDataFromLS();
    userData.height = {
        cm: heightData.cm,
        feetAndInches: heightData.feet_and_inches_string,
        unit: heightData.unit
    };
    saveUserDataToLS(userData);
    return userData;
}

/**
 * Save picker data based on type
 * @param {string} type - Type of picker data
 * @param {Object} pickerInstance - The picker instance
 * @returns {Object|null} Updated user data or null
 */
function savePickerData(type, pickerInstance) {
    switch (type) {
        case 'age':
            const ageData = pickerInstance.getSelectedDate();
            return saveAgeData(ageData);
        case 'weight':
            const weightData = pickerInstance.getSelectedWeight();
            return saveWeightData(weightData);
        case 'height':
            const heightData = pickerInstance.getSelectedHeight();
            return saveHeightData(heightData);
        default:
            return null;
    }
}

export const PickerFactory = {
    createPicker,
    savePickerData,
    saveAgeData,
    saveWeightData,
    saveHeightData
};