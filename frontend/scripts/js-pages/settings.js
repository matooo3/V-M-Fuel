import * as Auth from "../auth.js";
import * as Role from "../roleRouting.js";
import { loadHTMLTemplate } from '../templateLoader.js';
import { getLastHash } from "../script.js";
import * as Storage from "../storage.js";
import * as DropDown from '../drop-down.js';
import * as Native from '../native/native.js'

// ==============================
// ======= CARD ELEMENTS ========
// ==============================

export default async function loadSettings() {

    const app = document.getElementById('app');

    // LOAD app html-code
    const html = await loadHTMLTemplate('./html-pages/settings.html');
    app.innerHTML = html;

    Native.addNativeStyle(document.querySelector('.settings-container'));
    Native.removeNativeStyleToApp();

    hideNavbar();

    Role.renderUserRoleColors();

    loadSavedTheme()

    addEventListeners();

    await loadUserData();

}

function commaToDot(value) {
    return value.toString().replace(',', '.');
}

async function loadUserData() {
    const { gender, age, weight_kg, weight_pounds, height_cm, height_feet_and_inches, activityLevel, goal } = await Storage.getUserDataFromDB();

    const heightInput = document.getElementById('height-st');
    const weightInput = document.getElementById('weight-st');
    const ageInput = document.getElementById('age-st');
    const sexSelect = document.getElementById('sex-st');

    heightInput.value = height_cm;
    weightInput.value = commaToDot(weight_kg.toFixed(1));
    ageInput.value = age;

    heightInput.placeholder = "cm";
    weightInput.placeholder = "kg";
    ageInput.placeholder = "years";

    if (gender) {
        sexSelect.textContent = gender.toLowerCase();
    } else {
        sexSelect.textContent = "";
    }

    // === ACTIVITY LEVEL ===
    const activityCards = document.querySelectorAll('#activity-container .card-st-activity');
    activityCards.forEach(card => {
        const level = card.querySelector('.al-text-st').textContent;
        if (level === activityLevel) {
            card.classList.add('clicked-st-activity');
        } else {
            card.classList.remove('clicked-st-activity');
        }
    });

    // === GOAL LEVEL ===
    const goalCards = document.querySelectorAll('#goal-container .card-st-goal');
    goalCards.forEach(card => {
        const level = card.querySelector('.al-text-st').textContent;
        if (level === goal) {
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
    const weightKg = parseFloat(commaToDot(weightInput.value));
    const age = parseInt(ageInput.value, 10);
    const gender = sexSelect.textContent;

    // Calculate weight -> pounds
    const weightPounds = (weightKg * 2.20462).toFixed(1);

    // Calculate feet and inches from cm (rough)
    const totalInches = heightCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    const feetAndInches = `${feet}' ${inches}"`;

    const activityCard = document.querySelector('#activity-container .clicked-st-activity .al-text-st');
    const activityLevel = activityCard ? activityCard.textContent : null;

    const goalCard = document.querySelector('#goal-container .clicked-st-goal .al-text-st');
    const goal = goalCard ? goalCard.textContent : null;

    // const userData = {
    //     gender: gender,
    //     age: age,
    //     weight: {
    //         kg: weightKg,
    //         pounds: weightPounds
    //     },
    //     height: {
    //         cm: heightCm,
    //         feetAndInches: feetAndInches
    //     },
    //     activityLevel: activityLevel,
    //     goal: goal
    // };

    // Storage.saveUserData(userData);

    const userData = {
        gender: gender,
        age: age,
        weight_kg: weightKg,
        weight_pounds: weightPounds,
        height_cm: heightCm,
        height_feet_and_inches: feetAndInches,
        activityLevel: activityLevel,
        goal: goal
    }

    Storage.saveUserDataToDB(userData);

}

export function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    // #TODO
    if (savedTheme === 'dark') {
            Native.setStatusBarWhiteFont();
        } else {
            Native.setStatusBarBlackFont();
        }
}

function addSettingsDropdownFunctionality() {

    const savedTheme = localStorage.getItem('theme') || 'light';

    // sex
    const sexSelect = document.querySelector('.custom-select.sex-field');
    const sexDropDown = new DropDown.CustomSelect(sexSelect);
    sexDropDown.setValue();

    // theme
    const themeSelect = document.querySelector('.custom-select.theme-field');
    const themeDropDown = new DropDown.CustomSelect(themeSelect, (value) => {
        const selectedTheme = value;
        localStorage.setItem('theme', selectedTheme);
        document.body.classList.toggle('dark-mode', selectedTheme === 'dark');
        if (selectedTheme === 'dark') {
            Native.setStatusBarWhiteFont();
        } else {
            Native.setStatusBarBlackFont();
        }
    });

    themeDropDown.setValue(savedTheme);

    // calorie mode
    // const modeSelect = document.querySelector('.custom-select.mode-field');
    // new DropDown.CustomSelect(modeSelect, (value) => {
    //     // console.log("Calorie mode:", value)
    // });

    // language
    // const langSelect = document.querySelector('.custom-select.lang-field');
    // new DropDown.CustomSelect(langSelect, (value) => {
    //     // console.log("Language:", value)
    // });

}

function addEventListeners() {

    //dropdown menu
    addSettingsDropdownFunctionality();

    // DONT ALLOW TO ENTER NON-NUMERIC VALUES IN HEIGHT AND WEIGHT INPUTS
    const weightInput = document.getElementById('weight-st');

    weightInput.addEventListener('keypress', (e) => {
        const currentValue = weightInput.value;
        const allowed = /^[0-9]*([.,][0-9]*)?$/;
        const newValue = currentValue + e.key;
        if (!allowed.test(newValue)) {
            e.preventDefault();
        }
    });


    // close buttons
    const backArrow = document.querySelector('.bigger-hitbox-st');
    if (backArrow) {

        backArrow.addEventListener('click', saveSettings);

    }

    // const closeButton = document.querySelector('#close-settings-btn');
    // if (closeButton) {

    //     closeButton.addEventListener('click', referenceToLastHash);

    // }

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
        navbar.classList.add('hiddenNav');
        navbar.classList.remove('showNav');
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

    if (!isSettingsValid()) {
        // alert("Please fill out all required fields.");
        referenceToLastHash(); // alternativ => closeButton
        return;
    }

    console.log('Settings saved!');
    updateUserData();
    referenceToLastHash();

}

function isSettingsValid() {
    const height = document.getElementById("height-st").value.trim();
    const weight = document.getElementById("weight-st").value.trim();
    const age = document.getElementById("age-st").value.trim();
    const sex = document.getElementById("sex-st").textContent.trim();

    // const activitySelected = document.querySelector("#activity-container .al-card-st.selected");
    // const goalSelected = document.querySelector("#goal-container .goal-card-st.selected");

    return height && weight && age && sex;
}
