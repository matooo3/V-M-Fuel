import * as Auth from "../auth.js";
import * as Role from "../roleRouting.js";
import { loadHTMLTemplate } from '../templateLoader.js';
import { getLastHash } from "../script.js";

// ==============================
// ======= CARD ELEMENTS ========
// ==============================

export default async function loadSettings() {

    const app = document.getElementById('app');

    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/settings.html');
    app.innerHTML = html;

    hideNavbar();

    Role.renderUserRoleColors();

    addEventListeners();

}

function addEventListeners() {
    // close buttons
    const closeButtons = document.querySelectorAll('.close-button-refer');
    closeButtons.forEach(button => {
        button.addEventListener('click', referenceToLastHash);
    });

    // save button
    const saveSettingsButton = document.getElementById('save-settings-btn');
    if (saveSettingsButton) {
        saveSettingsButton.addEventListener('click', saveSettings);
    }

    // card selection (activity)
    const cards = document.querySelectorAll('.card-st-activity');
    cards.forEach(card => {
        card.addEventListener('click', function () {
            // Remove selected class from all cards
            cards.forEach(c => c.classList.remove('clicked-st-activity'));

            // Add selected class to clicked card
            this.classList.add('clicked-st-activity');
        });
    });

    // card selection (goal)
    const goalCards = document.querySelectorAll('.card-st-goal');
    goalCards.forEach(card => {
        card.addEventListener('click', function () {
            // Remove selected class from all cards
            goalCards.forEach(c => c.classList.remove('clicked-st-goal'));

            // Add selected class to clicked card
            this.classList.add('clicked-st-goal');
        });
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', Auth.logout);
}

// EXPORT EVENT LISTENER FOR SETTINGS BUTTON
export function loadSettingsEventListener() {
    const settingsButton = document.querySelector('.settings');
    if (settingsButton) {
        settingsButton.addEventListener('click', function () {
            window.location.href = '#settings';
        });
    }
}
// HIDE NAV WHEN OPENING SETTINGS
export function hideNavbar() {
    const navbar = document.getElementById('main-nav');
    if (navbar) {
        navbar.style.display = 'none';
    }
}

export function referenceToLastHash() {
    const lastHash = getLastHash();
    if (lastHash) {
        window.location.hash = lastHash;
    } else {
        window.location.hash = '#home';
    }
}

export function saveSettings() {

    // Implement save settings logic here
    // ....
    // ....
    // ....
    console.log('Settings saved!');
    // ....
    // ....
    // ....

    referenceToLastHash();

}