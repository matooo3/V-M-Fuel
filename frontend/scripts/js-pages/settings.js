import * as Auth from "../auth.js";
import * as Role from "../roleRouting.js";
import { loadHTMLTemplate } from '../templateLoader.js';

// ==============================
// ======= CARD ELEMENTS ========
// ==============================

export default async function loadMeals() {

    const app = document.getElementById('app');

    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/settings.html');
    app.innerHTML = html;

    hideNavbar();

    Role.renderUserRoleColors();



    // Event listener for card selection
    const cards = document.querySelectorAll('.card-st-activity');

    cards.forEach(card => {
        card.addEventListener('click', function () {
            // Remove selected class from all cards
            cards.forEach(c => c.classList.remove('clicked-st-activity'));

            // Add selected class to clicked card
            this.classList.add('clicked-st-activity');
        });
    });

    // same with card-st-goal
    const goalCards = document.querySelectorAll('.card-st-goal');

    goalCards.forEach(card => {
        card.addEventListener('click', function () {
            // Remove selected class from all cards
            goalCards.forEach(c => c.classList.remove('clicked-st-goal'));

            // Add selected class to clicked card
            this.classList.add('clicked-st-goal');
        });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', Auth.logout);

}

export function loadSettingsEventListener() {
    const settingsButton = document.querySelector('.settings');
    if (settingsButton) {
        settingsButton.addEventListener('click', function () {
            window.location.href = '#settings';
        });
    }
}

export function hideNavbar() {
    const navbar = document.getElementById('main-nav');
    if (navbar) {
        navbar.style.display = 'none';
    }
}