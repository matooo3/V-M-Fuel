import * as Auth from "../auth.js";
import * as Role from "../roleRouting.js";
import { loadHTMLTemplate } from '../templateLoader.js';
import { getLastHash } from "../script.js";
import * as Storage from "../storage.js";

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

    loadUserData();

}

function loadUserData() {
    const userData = Storage.getUserData();

    const heightInput = document.getElementById('height-st');
    const weightInput = document.getElementById('weight-st');
    const ageInput = document.getElementById('age-st');
    const sexSelect = document.getElementById('sex-st');

    heightInput.value = userData.height.cm;
    weightInput.value = userData.weight.kg;
    ageInput.value = userData.age;

    if (userData.gender) {
        sexSelect.value = userData.gender.toLowerCase();
    } else {
        sexSelect.value = "";
    }

    // === ACTIVITY LEVEL ===
    const activityCards = document.querySelectorAll('#activity-container .card-st-activity');
    activityCards.forEach(card => {
        const level = card.querySelector('.al-text-st').textContent;
        if (level === userData.activityLevel) {
            card.classList.add('clicked-st-activity');
        } else {
            card.classList.remove('clicked-st-activity');
        }
    });

    // === GOAL LEVEL ===
    const goalCards = document.querySelectorAll('#goal-container .card-st-goal');
    goalCards.forEach(card => {
        const level = card.querySelector('.al-text-st').textContent;
        if (level === userData.goal) {
            card.classList.add('clicked-st-goal');
        } else {
            card.classList.remove('clicked-st-goal');
        }
    });
}

function updateUserData() {
    const heightInput = document.getElementById('height-st');
    const weightInput = document.getElementById('weight-st');
    const ageInput = document.getElementById('age-st');
    const sexSelect = document.getElementById('sex-st');

    // Get values from inputs
    const heightCm = parseFloat(heightInput.value);
    const weightKg = parseFloat(weightInput.value);
    const age = parseInt(ageInput.value, 10);
    const gender = sexSelect.value;

    // Calculate weight -> pounds
    const weightPounds = weightKg * 2.20462;

    // Calculate feet and inches from cm (rough)
    const totalInches = heightCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    const feetAndInches = `${feet}' ${inches}"`;

    const activityCard = document.querySelector('#activity-container .clicked-st-activity .al-text-st');
    const activityLevel = activityCard ? activityCard.textContent : null;

    const goalCard = document.querySelector('#goal-container .clicked-st-goal .al-text-st');
    const goal = goalCard ? goalCard.textContent : null;

    const userData = {
        gender: gender,
        age: age,
        weight: {
            kg: weightKg,
            pounds: weightPounds
        },
        height: {
            cm: heightCm,
            feetAndInches: feetAndInches
        },
        activityLevel: activityLevel,
        goal: goal
    };

    Storage.saveUserData(userData);
}



function addEventListeners() {
    // close buttons
    const backArrow = document.querySelector('#arrow-back-st');
    if (backArrow) {

        backArrow.addEventListener('click', referenceToLastHash);
        backArrow.addEventListener('click', saveSettings);

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
        window.location.href = lastHash;
    } else {
        window.location.href = '#home';
    }
}

export function saveSettings() {

    console.log('Settings saved!');
    updateUserData();
    referenceToLastHash();

}