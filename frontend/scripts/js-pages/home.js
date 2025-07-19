// ./pages/home.js

import { loadHTMLTemplate } from '../templateLoader.js';
import * as Storage from '../storage.js';
import * as Auth from '/frontend/scripts/auth.js';
import * as Swipe from '../swipetodelete.js';
import * as Role from '../roleRouting.js';
import * as Settings from './settings.js';
import * as Search from '../searchBar.js';
import * as Plan from './plan.js'


let Meals = {
    breakfast: {
        dish_id: 204,
        factor: 1.07904,
        meal_category: "breakfast",
        name: "1",
        preparation: "#Whisk eggs #Sauté spinach briefly #Pour eggs into pan and cook until set",
        preparation_time_in_min: 7,
        tags: "[\"keto\", \"bulk\"]",
        total_calories: 270,
        total_carbs: 2,
        total_fat: 19,
        total_protein: 15,
        vm_score: 4,
        eaten: false
    },
    lunch: {
        dish_id: 205,
        name: '2',
        preparation: '#Sauté tofu #Add zucchini and spinach #Season with soy sauce and chili',
        vm_score: 5,
        meal_category: 'main',
        factor: 0.95,
        preparation_time_in_min: 15,
        tags: "[\"vegetarian\", \"asian\"]",
        total_calories: 10000,
        total_carbs: 11,
        total_fat: 21,
        total_protein: 17,
        eaten: false
    },
    dinner: {
        dish_id: 206,
        name: '3',
        preparation: '#Sauté tofu #Add zucchini and spinach #Season with soy sauce and chili',
        vm_score: 5,
        meal_category: 'main',
        factor: 1.2,
        preparation_time_in_min: 15,
        tags: "[\"vegetarian\", \"asian\"]",
        total_calories: 320,
        total_carbs: 12,
        total_fat: 22,
        total_protein: 18,
        eaten: false
    },
    puffer: null
};


export default async function loadHome() {
    const app = document.getElementById('app');
    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/home.html');
    app.innerHTML = html;

    //load user greeting! (eventlistener DOM loaded)
    // document.addEventListener('DOMContentLoaded', renderUserGreeting);
    getTodaysMeals();

    Role.renderAdminPanel();
    Role.renderUserRoleColors();

    setTimeout(() => {
        renderUserGreeting();
    }, 1);

    await updateAdminContainer();

    // get meals with eaten state
    let initialTodaysMealsWithState = await getTodaysMealsWithState();

    // render first meal
    const mealValues = Object.values(initialTodaysMealsWithState);
    const firstMeal = mealValues[0];
    renderNextMeal(firstMeal);

    // update ui accordingly
    await updateUI(initialTodaysMealsWithState);


    // Eventlistener: -------------------------------------------
    setUpInitialEventlisteners();

    // Settings Event Listener
    Settings.loadSettingsEventListener();

}

function setUpInitialEventlisteners() {

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            // Remove 'active' class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });

            // Add 'active' class to the clicked tab
            this.classList.add('active');
            // Update the admin-container content
            updateAdminContainer();

        });
    });

    const checkbox = document.getElementById('checked-circle');

    checkbox.addEventListener('change', async (event) => {
        console.log('Checkbox status:', event.target.checked);

        let todaysMealsWithState = await getTodaysMealsWithState();
        [todaysMealsWithState, currentKey] = updateAndSaveCurrentMeal(todaysMealsWithState);
        let nextMeal = getNextMeal(todaysMealsWithState, currentKey);

        await updateUI(todaysMealsWithState);

        setTimeout(() => {
            renderNextMeal(nextMeal);
            checkbox.checked = false;
        }, 300);

    });
}


async function updateAdminContainer() {
    const activeTab = document.querySelector('.tab.active');
    const adminContainer = document.getElementById('admin-container');

    if (activeTab && activeTab.textContent.trim() === 'Standard') {
        const html = await loadHTMLTemplate('/frontend/html-pages/homeStandard.html');
        adminContainer.innerHTML = html;
    } else {
        const html = await loadHTMLTemplate('/frontend/html-pages/homeRoles.html');
        adminContainer.innerHTML = html;
        renderUserList();
    }
}

// -----------------LOAD USER GREETING ---------------------
function renderUserGreeting() {
    const user = Auth.getUserFromToken();
    const container = document.getElementById('greeting-container');

    console.log("User data loaded:", user);

    container.innerHTML = `
        <div id="greeting-text">
            <span class="roboto">Hi,</span>
            <span class="roboto">${user.username}</span>
        </div>
        <div id="card-um${getRoleNumber(user.role)}" class="tag">
            <img class="tag-logo" src="/frontend/assets/icons/userRoleIcon${getRoleNumber(user.role)}.svg" alt="tag">
            <span id="text-um${getRoleNumber(user.role)}" class="tag-text">${enumToDisplay(user.role)}</span>
        </div>
        `;
}
// ------------------------------------------------------------
//

// --------------------- LOAD MEALS DATA ----------------------

// --------------------- Get Data ----------------------

function getTodaysIndexInWeek(today, currentWeek) {

    for (let i = 0; i < currentWeek.length; i++) {

        const day = currentWeek[i];
        if (day.getTime() === today.getTime()) {
            return i;
        }
    }
}

async function getTodaysMeals() {

    const { today, currentWeek } = Plan.getCurrentData();
    const index = getTodaysIndexInWeek(today, currentWeek);

    const weekPlan = await Storage.getWeekPlanFromDB();
    const todaysMeals = weekPlan[index]
    return todaysMeals;
}

function getEatenKcal(todaysMealsWithState) {

    let caloriesCount = 0;

    for (let i = 0; i < todaysMealsWithState.length; i++) {
        if (todaysMealsWithState[i].eaten) {

            caloriesCount += todaysMealsWithState[i].total_calories;

        } else {
            return caloriesCount;
        }
    }

    return caloriesCount;
}

function getMealsAmount(todaysMealsWithState) {
    const definedCount = Object.values(todaysMealsWithState).filter(v => v != null).length;
    return definedCount
}

async function calculatePercentage(eatenKcal, optimalKcal) {

    let percentage = (eatenKcal / optimalKcal) * 100;

    if (percentage > 100) {

        return 0;

    }

    return percentage;
}

// --------------------- Update Data ----------------------

async function updateUI(todaysMealsWithState) {

    let optimalKcal = await Plan.getOptimalKcal();
    let eatenKcal = getEatenKcal(todaysMealsWithState);

    console.log("Eaten Kcal:", eatenKcal);
    console.log("Optimal Kcal:", optimalKcal);

    updateProgressCircle(eatenKcal, optimalKcal);
    updateProgressCircleText(eatenKcal);
    updateMealsPlanned(todaysMealsWithState);
    updateGoalPercentage(eatenKcal, optimalKcal);

}

async function updateProgressCircle(eatenKcal, optimalKcal) {

    const percentage = await calculatePercentage(eatenKcal, optimalKcal);
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.setProperty('--progress-in-percent', percentage);

}

function updateProgressCircleText(eatenKcal) {

    const progressTextElement = document.querySelector('.progress-text');
    progressTextElement.textContent = `${eatenKcal} kcal`;

}

async function updateMealsPlanned(todaysMeals) {

    const mealsAmount = getMealsAmount(todaysMeals);
    const mealsPlanned = document.getElementById('planned-meals-h');
    mealsPlanned.textContent = mealsAmount;
}

async function updateGoalPercentage(eatenKcal, optimalKcal) {

    const percentage = await calculatePercentage(eatenKcal, optimalKcal);
    const goalPercentage = document.getElementById('goal-percentage-h');
    goalPercentage.textContent = `${Math.round(percentage)}%`;
}


// --------------------- Next Meals ----------------------

async function getNextMealsFromDB() {

    return Meals;
}

async function saveNextMealsToDB(todaysMealsWithState) {

    Meals = todaysMealsWithState;
    
}

async function getTodaysMealsWithState(reset = false) {

    let todaysMealsWithState = await getNextMealsFromDB();
    console.log("Todays Meals with State:", todaysMealsWithState);

    if (!todaysMealsWithState || reset) {

        let todaysMeals = await getTodaysMeals();
        todaysMealsWithState = initializeEatenState(todaysMeals);
        saveNextMealsToDB(todaysMealsWithState);

    }

    return todaysMealsWithState;

}

function initializeEatenState(todaysMeals, boolean = false) {

    Object.keys(todaysMeals).forEach(key => {

        if (todaysMeals[key]) {

            todaysMeals[key].eaten = boolean;
        }
    });

    return todaysMeals;
}

function setEatenState(clickedMeal) {

    clickedMeal.eaten = true;

    return clickedMeal;
}

function updateAndSaveCurrentMeal(todaysMealsWithState) {

    const keys = Object.keys(todaysMealsWithState);
    console.log("Keys:", keys);

    for (let i = 0; i < keys.length - 1; i++) {
        const currentKey = keys[i];

        if (!todaysMealsWithState[currentKey].eaten) {
            const nextKey = keys[i + 1];
            todaysMealsWithState[currentKey].eaten = true;
            saveNextMealsToDB(todaysMealsWithState);

            return [todaysMealsWithState, nextKey];
        }

    }
    return [null, null];
}

function getNextMeal(todaysMealsWithState, nextKey){
    return todaysMealsWithState[nextKey] || null;
}


function renderNextMeal(nextMeal) {

    if (!nextMeal) {
        renderCongratulations();
        return;
    }

    const mealName = document.querySelector('.meal-name');
    const meal_category = document.querySelector('.meal-category-h');
    const calories = document.querySelector('.calories-db');
    const nutritionValues = document.querySelectorAll('.nutrition-value-mp');

    mealName.textContent = nextMeal.name;
    meal_category.textContent = nextMeal.meal_category;
    calories.textContent = `${nextMeal.total_calories} kcal`;
    nutritionValues[0].textContent = nextMeal.total_protein; // Protein
    nutritionValues[1].textContent = nextMeal.total_carbs; // Carbs
    nutritionValues[2].textContent = nextMeal.total_fat; // Fat 
}

function renderCongratulations() {

    const div = document.querySelector(".next-meal-card-db");

    const congratsDiv = document.createElement("div");
    congratsDiv.classList.add("congratulations-message-db");
    congratsDiv.innerHTML = `
  <span> Congratulations! 🎉</span>
  <span>You have achieved your goal!</span> 
  <a href="#" id="congrats-link">reset</a>
  `;

    div.replaceWith(congratsDiv);

    resetEventlistener();

}

function resetEventlistener(){
    document.getElementById("congrats-link").addEventListener("click", async () => {

        let initialTodaysMealsWithState = await getTodaysMealsWithState(reset = true);
        await saveNextMealsToDB(initialTodaysMealsWithState);

        // render first meal
        const mealValues = Object.values(initialTodaysMealsWithState);
        const firstMeal = mealValues[0];
        renderNextMeal(firstMeal);

        // update ui accordingly
        await updateUI(initialTodaysMealsWithState);

    });
}

//
// --------------------------------------------------------------------------------------------
// --------------- LOAD USER DATA FROM DATABASE AND RENDER THEM IN <ul> as <li> ---------------
// --------------------------------------------------------------------------------------------
//

//
// --------- HELPER FUNCTIONS ------------
function getRoleNumber(role) {
    if (role === "user") {
        return 1;
    }
    if (role === "cook") {
        return 2;
    }
    if (role === "admin") {
        return 3;
    }
}

function enumToDisplay(role) {
    if (role === "user") {
        return "User";
    }
    if (role === "cook") {
        return "Chef";
    }
    if (role === "admin") {
        return "Admin";
    }
}
function displayToEnum(display) {
    if (display === "User") return "user";
    if (display === "Chef") return "cook";
    if (display === "Admin") return "admin";
}

function getInitials(name) {
    return name
        .split(" ")
        .map(part => part[0].toUpperCase())
        .join("")
        .slice(0, 2);
}
// ----------------------------------------------------
//

//
// ----------- RENDER USER MANAGEMENT LIST ------------
async function renderUserList() {
    const userListContainer = document.getElementById("user-list");
    userListContainer.innerHTML = "";

    const users = await Storage.getUsers();

    users.forEach(user => {
        const initials = getInitials(user.username);
        const userItem = document.createElement("li");
        userItem.classList.add("card", "user");

        userItem.innerHTML = `
        <div class="swipe-delete">Delete</div>
        <div class="swipe-content">
            <span class="item-id">${user.user_id}</span>
            <div class="profile-picture">
                <span>${initials}</span>
            </div>
            <div class="user-data">
                <span class="user-name">${user.username}</span>
                <span class="user-email">${user.email}</span>
            </div>
            <div id="user-role">
                <div class="user-tag" id="card-um${getRoleNumber(user.role)}">
                    <img class="user-tag-logo" src="/frontend/assets/icons/userRoleIcon${getRoleNumber(user.role)}.svg" alt="tag">
                    <span id="text-um${getRoleNumber(user.role)}" class="user-tag-text">${enumToDisplay(user.role)}</span>
                </div>
                <img id="change-role" src="/frontend/assets/icons/change-role.svg" alt="change role">
            </div>
        </div>
        `;

        userListContainer.appendChild(userItem);
    });

    // Update the total users count
    renderTotalUsers();

    if (userListContainer) {
        Swipe.initializeSwipeToDelete(userListContainer, '.card.user', deleteUser);
    }

    // add eventlistener for change role button
    const changeRoleButtons = document.querySelectorAll("#change-role");
    changeRoleButtons.forEach(button => {
        button.addEventListener("click", changeUserRole);
    });


    const searchInputUser = "user-search-bar";
    const userList = ['#user-list'];
    Search.searchULs(searchInputUser, userList);
}

function deleteUser(user_id) {
    Storage.deleteUserFromDB(user_id);
    renderTotalUsers();
}

// -----------------------END-----------------------------
//

//
// ----------------- CHANGE USER ROLE --------------------
function denyAdminRoleChange(role, targetName, TargetEmail) {
    if (role === "admin") {
        // wenn es der user selbst ist, dann kann er seine Rolle nicht ändern
        const user = Auth.getUserFromToken();


        if (user.email === TargetEmail) { // sich selbst
            alert("You cannot change your own role.");
            throw new Error("Admin role change denied for self.");
        } else {
            if (!(user.name === "admin") && !(user.email === "admin@admin.com")) { // super-user darf admin degradieren
                alert("You cannot change the role of an admin.");
                throw new Error("Admin role change denied for super user.");
            }
        }
    }
}

async function changeUserRole(event) {
    const userItem = event.target.closest(".user");
    const name = userItem.querySelector(".user-name").textContent;
    const email = userItem.querySelector(".user-email").textContent;
    const role = userItem.querySelector(".user-tag-text").textContent;
    const roleFormatted = displayToEnum(role);

    denyAdminRoleChange(roleFormatted, name, email);


    // get next role in array
    const indexNewRole = getRoleNumber(roleFormatted) % 3;
    const arrayOfRoles = ["user", "cook", "admin"];

    const newRole = arrayOfRoles[indexNewRole];

    await Storage.changeUserRoleInDB(newRole, email);

    renderUserList();
    renderUserGreeting();

}
// ------------------- DB UPDATED -------------------
// 

//
// ----------------- TOTAL USERS --------------------
function getTotalUsers() {
    // greife auf <ul> zu und zähle die <li> Elemente
    const userList = document.getElementById("user-list");

    if (userList) {
        return userList.querySelectorAll("li").length;
    }

    return 0;
}

function renderTotalUsers() {

    const totalUsersAmount = document.getElementById("total-users-amount");
    if (totalUsersAmount) {
        totalUsersAmount.textContent = getTotalUsers();
    }
}
//
// --------------------------------------------------------------------------------------------
// ---------------                               END                            ---------------
// --------------------------------------------------------------------------------------------
//
