import { loadHTMLTemplate } from "../templateLoader.js";
import * as Settings from "./settings.js";
import * as Algo from "../algo/algo.js";
import * as Storage from "../storage.js";

// ===== MAIN EXPORT =====
export default async function loadPlan() {
    const app = document.getElementById("app");
    const html = await loadHTMLTemplate("/frontend/html-pages/plan.html");
    app.innerHTML = html;

    const { today, currentWeek } = getCurrentData();

    await initializeCalendar(today, currentWeek);
    addGenerateEventListener(today, currentWeek);

    Settings.loadSettingsEventListener();

}

// ===== INITIALIZATION =====
async function initializeCalendar(today, currentWeek) {

    setupWeekDisplay(today, currentWeek);
    await setupWeekContent(today, currentWeek);

}

async function setupWeekContent(today, currentWeek) {

    const dayContent = await generateDayContent(currentWeek);
    showDay(today.getDate(), dayContent);
    addDayEventListeners(dayContent);

}

// ===== WEEK SETUP =====

function getCurrentData() {

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
        return 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
    } else {
        return 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
    }
}

function calculateBMR_MifflinStJeor(gender, age, weightKg, heightCm) {
    const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
}

function getActivityMultiplier(activityLevel) {
    const normalized = activityLevel.toLowerCase().trim().split('\n')[0];

    const activityMap = {
        'very low': 1.2,
        'low': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very active': 1.9
    };

    return activityMap[normalized] || 1.55; // Default: moderate
};

function getGoalAdjustment(goal) {
    const normalized = goal.toLowerCase().trim();

    const goalMap = {
        'maintaining weight': 0,
        'gaining weight': 200,
        'losing weight': -200
    };

    return goalMap[normalized] || 0; // Default: maintaining

};

function calculateCalories(gender, age, weightKg, heightCm, activityMultiplier, goalAdjustment) {

    let bmr = 0;

    switch (goalAdjustment) {
        case 200:
            // Bulk (Miffilin):
            bmr = calculateBMR_MifflinStJeor(gender, age, weightKg, heightCm);
            break;
        case 0:
            // Maintain (Miffilin):
            bmr = (calculateBMR_MifflinStJeor(gender, age, weightKg, heightCm) + calculateBMR_HarrisBenedict(gender, age, weightKg, heightCm)) / 2;
            break;
        case -200:
            // Cut (Harris):
            bmr = calculateBMR_HarrisBenedict(gender, age, weightKg, heightCm);
            break;
    }

    // TDEE = BMR × Activity Level
    const tdee = bmr * activityMultiplier;

    // Finaler Kalorienbedarf = TDEE + Ziel-Adjustment
    return Math.round(tdee + goalAdjustment);

};

function getRequiredCalories() {
    let userData = Storage.getUserData();
    const gender = userData.gender.toLowerCase().trim();
    const age = userData.age;
    const weightKg = userData.weight.value;
    const heightCm = userData.height.cm;
    const activityMultiplier = getActivityMultiplier(userData.activityLevel);
    const goalAdjustment = getGoalAdjustment(userData.goal);

    let requiredCalories = calculateCalories(gender, age, weightKg, heightCm, activityMultiplier, goalAdjustment);
    return requiredCalories
}

// ===== CONTENT GENERATION =====

async function generateDayContent(currentWeek) {

    let dailyCalories = getRequiredCalories();
    console.log("Daily Calories: " + dailyCalories);
    console.log("Starting Algorithm...")
    const weekPlan = await Algo.algo(dailyCalories, 0, 0, 0);
    const dayContent = {};

    currentWeek.forEach((date, index) => {
        const dayNumber = date.getDate();
        dayContent[dayNumber] = renderDay(weekPlan[index]);
    });

    return dayContent;
}

function renderDay(dayPlan) {
    let html = "";
    html += renderMeal(dayPlan.breakfast, "Breakfast");
    html += renderMeal(dayPlan.lunch, "Lunch");
    html += renderMeal(dayPlan.dinner, "Dinner");
    return html;
}

function renderMeal(dish, mealType) {
    return `
    <div class="card drop-shadow plan-meal-card">
        <div class="meal-header-mp">
            <div>
                <h3 class="meal-title-mp">${dish.name}</h3>
                <p class="subtext">${mealType}</p>
            </div>
            <div class="meal-calories-mp">${dish.total_calories} ckal</div>
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
                <img class="clock-logo-mp" src="/frontend/assets/icons/clock.svg" alt="clock">
                <p class="footer-text-mp">${dish.preparation_time_in_min}</p>
            </div>
            <div class="footer-mp">
                <img class="users-logo-mp" src="/frontend/assets/icons/users.svg" alt="users">
                <p class="footer-text-mp">1 serving</p>
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
function addDayEventListeners(dayContent) {
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
        });
    });
}

function addGenerateEventListener(today, currentWeek) {
    const generateBtn = document.querySelector('#regenerate-plan');

    if (generateBtn) {
        generateBtn.addEventListener("click", async () => {

            await setupWeekContent(today, currentWeek);

        });
    }
}
