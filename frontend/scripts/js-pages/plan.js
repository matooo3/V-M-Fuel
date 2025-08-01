import { loadHTMLTemplate } from "../templateLoader.js";
import * as Settings from "./settings.js";
import * as Algo from "../algo/algo.js";
import * as Storage from "../storage.js";
import * as Home from "../js-pages/home.js";
import * as Script from '../script.js';

// ===== MAIN EXPORT =====
export default async function loadPlan() {
    Script.showNavbar();

    const app = document.getElementById("app");
    const html = await loadHTMLTemplate("../../html-pages/plan.html");
    app.innerHTML = html;

    const { today, currentWeek } = getCurrentData();

    await initializeCalendar(today, currentWeek);
    addGenerateEventListener(today, currentWeek);

    Settings.loadSettingsEventListener();

}

// ===== INITIALIZATION =====
async function initializeCalendar(today, currentWeek) {

    setupWeekDisplay(today, currentWeek);

    const weekPlan = await getWeekPlan();

    await setupWeekContent(today, currentWeek, weekPlan);
    addOverlayEventlisteners(weekPlan);

}

async function setupWeekContent(today, currentWeek, weekPlan) {

    const dayContent = await generateDayContent(currentWeek, weekPlan);
    addDayEventListeners(dayContent, weekPlan);

}

// LOAD WEEK PLAN DB // CALCULATE NEW ONE IF NO ONE EXISTS
export async function getWeekPlan() {
    // check if user already has a week plan
    let weekPlan = await Storage.getWeekPlanFromDB();

    if (!weekPlan || weekPlan.length === 0) {// wenn noch keiner existiert
        console.warn("Week plan not found in database. Generating a new one...");
        weekPlan = await generateNewWeekPlan();
    }

    console.warn("Week plan loaded from DB:", weekPlan);

    return weekPlan;
}

async function generateNewWeekPlan() {

    let kcalOptimal = await getOptimalKcal();

    console.log("Optimal daily Calories!: " + kcalOptimal);

    return await Algo.algo(kcalOptimal, 0, 0, 0);

}

// ===== WEEK SETUP =====

export function getCurrentData() {

    const today = new Date();
    const currentWeek = calculateCurrentWeek(today);

    return { today, currentWeek };

}

function setupWeekDisplay(today, currentWeek) {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    updateMonthYearDisplay(monthNames, currentMonth, currentYear);
    populateDaysGrid(today, currentWeek);
}

function calculateCurrentWeek(today) {
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - mondayOffset);

    const week = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        week.push(day);
    }
    return week;
}

function updateMonthYearDisplay(monthNames, currentMonth, currentYear) {
    const monthYearElement = document.getElementById("monthYear");
    if (monthYearElement) {
        monthYearElement.innerHTML = `${monthNames[currentMonth]}<br>${currentYear}`;
    }
}

function populateDaysGrid(today, currentWeek) {
    const daysGrid = document.getElementById("daysGrid");
    if (!daysGrid) return;

    daysGrid.innerHTML = "";
    const currentMonth = today.getMonth();

    currentWeek.forEach((date) => {
        const dayElement = document.createElement("div");
        dayElement.className = "day";
        dayElement.textContent = date.getDate();
        dayElement.setAttribute("data-day", date.getDate());

        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add("selected");
        }

        if (date.getMonth() !== currentMonth) {
            dayElement.classList.add("other-month");
        }

        daysGrid.appendChild(dayElement);
    });
}


// ===== CALORIE CALCULATION =====

function calculateBMR_HarrisBenedict(gender, age, weightKg, heightCm) {
    if (gender === 'male') {
        return 66.47 + (13.75 * weightKg) + (5 * heightCm) - (6.755 * age);
    } else {
        return 655.1 + (9.563 * weightKg) + (1.85 * heightCm) - (4.676 * age);
    }
}

function calculateBMR_MifflinStJeor(gender, age, weightKg, heightCm) {
    const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
}

function getActivityMultiplier(activityLevel) {
    const normalized = activityLevel.toLowerCase();

    const activityMap = {
        'very low': 1.2,
        'low': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very active': 1.9
    };

    return activityMap[normalized] || 1.55; // Default: moderate
};

const GOAL_ADJUSTMENT_LOSE = -200;
const GOAL_ADJUSTMENT_MAINTAIN = 0;
const GOAL_ADJUSTMENT_GAIN = 200;

function getGoalAdjustment(goal) {
    const normalized = goal.toLowerCase().trim();

    const goalMap = {
        'losing weight': GOAL_ADJUSTMENT_LOSE,
        'maintaining weight': GOAL_ADJUSTMENT_MAINTAIN,
        'gaining weight': GOAL_ADJUSTMENT_GAIN
    };

    return goalMap[normalized] || 0; // Default: maintaining

};

function calculateCalories(gender, age, weightKg, heightCm, activityMultiplier, goalAdjustment) {

    let bmr = 0;

    switch (goalAdjustment) {

        case GOAL_ADJUSTMENT_LOSE:
            // Cut (Harris):
            bmr = calculateBMR_HarrisBenedict(gender, age, weightKg, heightCm);
            break;

        case GOAL_ADJUSTMENT_MAINTAIN:
            // Maintain (Miffilin):
            bmr = (calculateBMR_MifflinStJeor(gender, age, weightKg, heightCm) + calculateBMR_HarrisBenedict(gender, age, weightKg, heightCm)) / 2;
            break;

        case GOAL_ADJUSTMENT_GAIN:
            // Bulk (Miffilin):
            bmr = calculateBMR_MifflinStJeor(gender, age, weightKg, heightCm);
            break;
    }

    // TDEE = BMR × Activity Level
    const tdee = bmr * activityMultiplier;

    // Final calorie requirement = TDEE + Goal adjustment
    return Math.round(tdee + goalAdjustment);

};

export async function getOptimalKcal() {

    let optimalKcal = 0; // default value;

    const { gender, age, weight_kg, weight_pounds, height_cm, height_feet_and_inches, activityLevel, goal } = await Storage.getUserDataFromDB();

    if (gender && age && weight_kg && height_cm && activityLevel && goal) {

        const gender1 = gender.toLowerCase().trim();
        const age1 = age;
        const weightKg1 = weight_kg;
        const heightCm1 = height_cm;
        const activityMultiplier1 = getActivityMultiplier(activityLevel);
        const goalAdjustment1 = getGoalAdjustment(goal);

        optimalKcal = calculateCalories(gender1, age1, weightKg1, heightCm1, activityMultiplier1, goalAdjustment1);

        console.log("Calculated optimal calories: " + optimalKcal);

    }

    return optimalKcal;

}

// ===== CONTENT GENERATION =====

async function generateDayContent(currentWeek, weekPlan) {

    const dayContent = {};

    currentWeek.forEach((date, index) => {
        const dayNumber = date.getDate();
        dayContent[dayNumber] = renderDay(weekPlan[index]);
    });

    Storage.saveWeekPlanToDB(weekPlan);

    return dayContent;
}

function renderDay(dayPlan) {
    let html = "";
    html += renderMeal(dayPlan.breakfast, "Breakfast");
    html += renderMeal(dayPlan.lunch, "Lunch");
    html += renderMeal(dayPlan.dinner, "Dinner");
    return html;
}

function getCurrentlySelectedDay() {
    const selectedDayElement = document.querySelector(".day.selected");
    if (selectedDayElement) {
        return parseInt(selectedDayElement.getAttribute("data-day"));
    }
    return null;
}

function renderMeal(dish, mealType) {
    return `
    <div class="card drop-shadow plan-meal-card" data-id="${dish.dish_id}">
        <div class="meal-header-mp">
            <div>
                <h3 class="meal-title-mp">${dish.name}</h3>
                <p class="subtext">${mealType}</p>
            </div>
            <div class="meal-calories-mp">${dish.total_calories} kcal</div>
        </div>
        <div class="nutrition-values-mp">
            <div class="nutrition-item-mp">
                <p class="nutrition-value-mp">${dish.total_protein}g</p>
                <p class="nutrition-label-mp subtext">Protein</p>
            </div>
            <div class="nutrition-item-mp">
                <p class="nutrition-value-mp">${dish.total_carbs}g</p>
                <p class="nutrition-label-mp subtext">Carbs</p>
            </div>
            <div class="nutrition-item-mp">
                <p class="nutrition-value-mp">${dish.total_fat}g</p>
                <p class="nutrition-label-mp subtext">Fat</p>
            </div>
            <div class="nutrition-item-mp">
                <p class="nutrition-value-mp">${dish.vm_score}</p>
                <p class="nutrition-label-mp subtext">VM score</p>
            </div>
        </div>
        <div class="meal-details-mp">
            <div class="footer-mp">
                <img class="clock-logo-mp" src="../../assets/icons/clock.svg" alt="clock">
                <p class="footer-text-mp">${dish.preparation_time_in_min}</p>
            </div>
            <div class="footer-mp">
                <img class="users-logo-mp" src="../../assets/icons/users.svg" alt="users">
                <p class="footer-text-mp">${(dish.factor ?? 1).toFixed(1)} serving</p>
            </div>
        </div>
    </div>
    `;
}

// ===== DISPLAY FUNCTIONS =====
function showDay(day, dayContent) {
    const content = dayContent[day] || "";
    const section = document.getElementById("content-section");
    if (section) {
        section.innerHTML = content;
    }
}

// ===== EVENT LISTENERS =====
function addDayEventListeners(dayContent, weekPlan) {
    // Remove existing listeners
    document.querySelectorAll(".day").forEach((dayElement) => {
        dayElement.replaceWith(dayElement.cloneNode(true));
    });

    // Add new listeners
    document.querySelectorAll(".day").forEach((dayElement) => {
        dayElement.addEventListener("click", () => {
            document.querySelectorAll(".day").forEach((d) => d.classList.remove("selected"));
            dayElement.classList.add("selected");

            const day = parseInt(dayElement.getAttribute("data-day"));
            showDay(day, dayContent);
            addOverlayEventlisteners(weekPlan);
        });
    });

    const currentlySelectedDay = getCurrentlySelectedDay();
    if (currentlySelectedDay) {
        showDay(currentlySelectedDay, dayContent);
    }
}

// OVERLAY

function addOverlayEventlisteners(weekPlan) {

    document.getElementById('viewDishOverlay').addEventListener('click', function (e) {
        if (e.target === this) {
            hideOverlay();
            Script.hideNavOverlay();
            resetLists()
            updateCompletedSteps(0);
            updateCookingProgressBarAndPercentageText(0);
        }
    });

    document.getElementById('navOverlay').addEventListener('click', function (e) {
        if (isPlanPage()) {
            hideOverlay();
            Script.hideNavOverlay();
            resetLists();
            updateCompletedSteps(0);
            updateCookingProgressBarAndPercentageText(0);
        }
    });

    document.querySelector('#close-view-dish').addEventListener('click', function (e) {
        hideOverlay();
        Script.hideNavOverlay();
        resetLists();
        updateCompletedSteps(0);
        updateCookingProgressBarAndPercentageText(0);
    });

    document.getElementById('reset-cooking-process').addEventListener('click', function (e) {

        const checkedCheckboxes = document.querySelectorAll('#view-dish-instructions-list .checkbox-overlay:checked');
        checkedCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        updateCompletedSteps(0);
        updateCookingProgressBarAndPercentageText(0);
    });

    const dishes = document.querySelectorAll('.plan-meal-card');
    dishes.forEach((dish) => {
        const id = dish.dataset.id
        dish.addEventListener("click", () => {
            showOverlay();
            Script.showNavOverlay();
            renderDishInfo(id, weekPlan);
            addCheckboxInstrEventlistener();
        });
    })
}

function isPlanPage() {
    const isPlanPage = document.querySelector('#meal-plan') != null;
    return isPlanPage;
}

function addCheckboxInstrEventlistener() {
    const checkboxes = document.querySelectorAll('.checkbox-overlay');

    checkboxes.forEach(cb => {
        cb.addEventListener('change', event => {
            const checkedCheckboxes = document.querySelectorAll('#view-dish-instructions-list .checkbox-overlay:checked');
            updateCompletedSteps(checkedCheckboxes.length);
            updateCookingProgressBarAndPercentageText(checkedCheckboxes.length);
        });
    });
}

function updateCookingProgressBarAndPercentageText(completedSteps) {

    let width = 0 + "%";

    if (completedSteps !== 0) {

        const totalSteps = getTotalCookingSteps();
        let percentage = (completedSteps / totalSteps) * 100
        width = percentage.toFixed(1) + "%";

    }

    const progressBar = document.getElementById('cooking-progress-fill');
    const percText = document.getElementById('view-%-steps');
    progressBar.style.width = width;
    percText.textContent = width;

}

function showOverlay() {
    const overlay = document.getElementById('viewDishOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function hideOverlay() {
    const overlay = document.getElementById('viewDishOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// UTILITY FUNCTIONS

function getMealbyIdInWeekplan(id, weekPlan) {
    for (const day of weekPlan) {
        for (const meal of Object.values(day)) {
            if (meal && meal.dish_id === Number(id)) {
                return meal;
            }
        }
    }
    return null;
}

function splitInSteps(preparation) {
    const matches = preparation.match(/(\d)([^0-9]+)/g);

    const preparationSteps = {};

    if (matches) {
        matches.forEach(step => {
            const key = step.match(/^\d/)[0];
            const value = step.slice(2).trim();
            preparationSteps[key] = value;
        });
    }
    return preparationSteps;
}

function getTotalCookingSteps() {
    const list = document.getElementById('view-dish-instructions-list');
    const listItems = list.querySelectorAll('li');
    const totalSteps = listItems.length;
    return totalSteps
}

function updateCompletedSteps(steps) {
    document.getElementById('view-completed-number').textContent = steps;
}

function resetLists() {
    const instructionsList = document.getElementById('view-dish-instructions-list');
    const ingredientsList = document.getElementById('view-dish-ingredients-list');
    instructionsList.innerHTML = '';
    ingredientsList.innerHTML = '';

}

// RENDER FUNCTIONS
function renderDishInfo(id, weekPlan) {

    // get cklicked meal
    const meal = getMealbyIdInWeekplan(id, weekPlan);

    //load macros
    renderDishMacrosAndName(meal);

    //load ingredients
    renderDishIngredients(meal.ingredients);

    // load prep steps
    let preparationSteps = splitInSteps(meal.preparation);
    renderDishPreparationSteps(preparationSteps);

    //load cooking process
    renderTotalCookingStepsText();

}

function renderTotalCookingStepsText() {

    const totalSteps = getTotalCookingSteps();
    document.getElementById('view-total-number').textContent = totalSteps;

}

function renderDishIngredients(ingredients) {
    const list = document.getElementById('view-dish-ingredients-list');
    for (const key in ingredients) {
        let ingredientHTML = getIngredientHTML(ingredients[key]);
        list.insertAdjacentHTML('beforeend', ingredientHTML);
    }
}

function renderDishPreparationSteps(preparationSteps) {

    const list = document.getElementById('view-dish-instructions-list');

    Object.entries(preparationSteps).forEach(([stepNumber, text]) => {
        const preparationHTML = getPreparationHTML(stepNumber, text);
        list.insertAdjacentHTML('beforeend', preparationHTML);
    });
}

function renderDishMacrosAndName(meal) {

    document.getElementById('view-dish-name').textContent = meal.name;
    document.getElementById('view-kcal').textContent = meal.total_calories;
    document.getElementById('view-prep-time').textContent = meal.preparation_time_in_min;
    document.getElementById('view-protein-amount').textContent = meal.total_protein + "g";
    document.getElementById('view-carbs-amount').textContent = meal.total_carbs + "g";
    document.getElementById('view-fat-amount').textContent = meal.total_fat + "g";
    document.getElementById('view-vm-score').textContent = meal.vm_score;
}


// GET HTML CODE FUNCTIONS
function getIngredientHTML(ingredient) {
    return `
    <li class="view-dish-ingredient-el">
        <p class="view-dish-ingredient-name">${ingredient.name}</p>
        <p class="subtext view-dish-ingredient-amount">${ingredient.amount_scaled} ${ingredient.unit_of_measurement}</p>
    </li>
    `
}

function getPreparationHTML(stepNumber, text) {
    return `
    <li class="view-instruction-step-el">
        <input type="checkbox" class="checkbox-overlay">
        <div class="view-instruction-text-container">
            <p class="view-instruction-header">Step ${stepNumber}</p>
            <p class="view-instruction-text">${text}</p>
        </div>
    </li>
    `
}

// END OVERLAY

function addGenerateEventListener(today, currentWeek) {
    const generateBtn = document.querySelector('#regenerate-plan');

    if (generateBtn) {
        generateBtn.addEventListener("click", async () => {

            const currentlySelectedDay = getCurrentlySelectedDay();

            const weekPlan = await generateNewWeekPlan();

            const dayContent = await generateDayContent(currentWeek, weekPlan, today);

            await Storage.deleteOldAndCreateNewList();

            let todaysMeals = await Home.getTodaysMeals(weekPlan);
            todaysMeals = await Home.initializeEatenState(todaysMeals);
            await Storage.saveNextMealsToDB(todaysMeals);

            addDayEventListeners(dayContent, weekPlan);


            if (currentlySelectedDay) {
                showDay(currentlySelectedDay, dayContent);
            }

            addOverlayEventlisteners(weekPlan);

        });
    }

}