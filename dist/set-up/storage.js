export function getUserDataFromLS () {
    try {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error reading user data:', error);
        return {};
    }
};

export function saveToLS (key, data) {
    if (data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

}

export function saveUserDataToLS (userData) {
    saveToLS('userData', userData);
};