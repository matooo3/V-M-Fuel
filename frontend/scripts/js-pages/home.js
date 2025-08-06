// ./pages/home.js

import { loadHTMLTemplate } from '../templateLoader.js';
import * as Storage from '../storage.js';
import * as Auth from '../auth.js';
import * as Swipe from '../swipetodelete.js';
import * as Role from '../roleRouting.js';
import * as Settings from './settings.js';
import * as Search from '../searchBar.js';
import * as Plan from './plan.js';
import * as Script from '../script.js';
import * as Sound from '../sound.js';
import * as Native from '../native/native.js'

export default async function loadHome() {
    Script.showNavbar();

    const app = document.getElementById('app');
    // LOAD app html-code
    const html = await loadHTMLTemplate('./html-pages/home.html');
    app.innerHTML = html;

    Native.addNativeStyle(document.getElementById('home-container'));
    Native.addNativeStyleToApp();

    //load user greeting! (eventlistener DOM loaded)
    // document.addEventListener('DOMContentLoaded', renderUserGreeting);

    Role.renderAdminPanel();
    Role.renderUserRoleColors();

    setTimeout(() => {
        renderUserGreeting();
    }, 1);

    await updateAdminContainer();

    // Eventlistener: -------------------------------------------

    // Settings Event Listener
    Settings.loadSettingsEventListener();

}

function setUpInitialEventlisteners() {

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', async function () {
            // Remove 'active' class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });

            // Add 'active' class to the clicked tab
            this.classList.add('active');
            // Update the admin-container content
            await updateAdminContainer();
        });
    });
}

function addCheckboxEventListener() {

    const checkbox = document.getElementById('checked-circle');

    if (checkbox) {
        checkbox.addEventListener('change', async () => {

            Sound.playCheckSound();

            await sleep(100);

            let todaysMealsWithState = await getTodaysMealsWithState();
            let currentKey = 'breakfast';
            [todaysMealsWithState, currentKey] = await updateAndSaveCurrentMeal(todaysMealsWithState);
            let nextMeal = getNextMeal(todaysMealsWithState, currentKey);

            await updateUI(todaysMealsWithState);

            setTimeout(() => {
                renderNextMeal(nextMeal, currentKey);
                checkbox.checked = false;
            }, 300);

        });
    }
}

export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateAdminContainer() {
    const activeTab = document.querySelector('.tab.active');
    const adminContainer = document.getElementById('admin-container');

    if (activeTab && activeTab.textContent.trim() === 'Standard' && adminContainer) {
        const html = await loadHTMLTemplate('./html-pages/homeStandard.html');
        adminContainer.innerHTML = html;

        // get meals with eaten state
        let initialTodaysMealsWithState = await getTodaysMealsWithState();
        await Storage.saveNextMealsToDB(initialTodaysMealsWithState);
        // render first meal
        renderFirstUneatenMeal(initialTodaysMealsWithState);

        renderTodaysMeals(initialTodaysMealsWithState);

        // update ui accordingly
        await updateUI(initialTodaysMealsWithState);

        setUpInitialEventlisteners();
    } else {
        const html = await loadHTMLTemplate('./html-pages/homeRoles.html');
        adminContainer.innerHTML = html;
        await renderUserList();
    }
}

function renderFirstUneatenMeal(initialTodaysMealsWithState) {

    const keys = Object.keys(initialTodaysMealsWithState);
    for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];
        const meal = initialTodaysMealsWithState[currentKey];
        if (meal && !meal.eaten) {
            renderNextMeal(meal, currentKey);
            return;
        }

    }
    // if every meal is eaten
    renderNextMeal(null);
}

// -----------------LOAD USER GREETING ---------------------
function renderUserGreeting() {
    const user = Auth.getUserFromToken();
    const container = document.getElementById('greeting-container');

    if (container) {
        container.innerHTML = `
        <div id="greeting-text">
            <span class="roboto">Hi,</span>
            <span class="roboto">${user.username}</span>
        </div>
        <div id="card-um${getRoleNumber(user.role)}" class="tag">
            <img class="tag-logo" src="./assets/icons/userRoleIcon${getRoleNumber(user.role)}.svg" alt="tag">
            <span id="text-um${getRoleNumber(user.role)}" class="tag-text">${enumToDisplay(user.role)}</span>
        </div>
        `;
    }
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

export async function getTodaysMeals(weekPlan = null) {

    const { today, currentWeek } = Plan.getCurrentData();
    const index = getTodaysIndexInWeek(today, currentWeek);

    if (!weekPlan) {
        weekPlan = await Plan.getWeekPlan();
        Storage.saveWeekPlanToDB(weekPlan);
    }

    const todaysMeals = weekPlan[index];
    return todaysMeals;
}

function getEatenKcal(todaysMealsWithState) {

    let caloriesCount = 0;
    const keys = Object.keys(todaysMealsWithState);

    for (let i = 0; i < keys.length - 1; i++) {

        const currentKey = keys[i];

        if (todaysMealsWithState[currentKey].eaten) {

            caloriesCount += todaysMealsWithState[currentKey].total_calories;

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

        return 100;

    }

    return percentage;
}

// --------------------- Update Data ----------------------

async function updateUI(todaysMealsWithState) {

    let optimalKcal = await Plan.getOptimalKcal();
    let eatenKcal = getEatenKcal(todaysMealsWithState);

    console.log("Eaten Kcal:", eatenKcal);
    console.log("Optimal Kcal:", optimalKcal);

    updateProgressCircleText(eatenKcal);
    await updateProgressCircle(eatenKcal, optimalKcal);
    updateMealsPlanned(todaysMealsWithState);
    updateGoalPercentage(eatenKcal, optimalKcal);
    updateTodaysMeals(todaysMealsWithState);

}

async function updateProgressCircle(eatenKcal, optimalKcal) {

    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        let percentage = await calculatePercentage(eatenKcal, optimalKcal);
        progressBar.style.setProperty('--progress-in-percent', percentage);
    }

}

function updateProgressCircleText(eatenKcal) {

    const progressTextElement = document.querySelector('.progress-text');

    if (progressTextElement) {
        progressTextElement.textContent = `${eatenKcal} kcal`;
    }

}

async function updateMealsPlanned(todaysMeals) {

    const mealsAmount = getMealsAmount(todaysMeals);
    const mealsPlanned = document.getElementById('planned-meals-h');

    if (mealsAmount && mealsPlanned) {
        mealsPlanned.textContent = mealsAmount;
    }
}

async function updateGoalPercentage(eatenKcal, optimalKcal) {

    const percentage = await calculatePercentage(eatenKcal, optimalKcal);
    const goalPercentage = document.getElementById('goal-percentage-h');

    if (goalPercentage) {
        goalPercentage.textContent = `${Math.round(percentage)}%`;
    }
}


// --------------------- Next Meals ----------------------

export async function getTodaysMealsWithState(reset = false) {

    let todaysMealsWithState = await Storage.getNextMealsFromDB();

    if (!todaysMealsWithState || Object.keys(todaysMealsWithState).length === 0 || reset) {

        let todaysMeals = await getTodaysMeals();
        todaysMealsWithState = initializeEatenState(todaysMeals);
        console.log("First meals save:", todaysMealsWithState);

    }

    return todaysMealsWithState;

}

export function initializeEatenState(todaysMeals, boolean = false) {

    Object.keys(todaysMeals).forEach(key => {

        if (todaysMeals[key]) {

            todaysMeals[key].eaten = boolean;
        }
    });

    return todaysMeals;
}

async function updateAndSaveCurrentMeal(todaysMealsWithState) {

    const keys = Object.keys(todaysMealsWithState);

    for (let i = 0; i < keys.length - 1; i++) {
        const currentKey = keys[i];

        if (!todaysMealsWithState[currentKey].eaten) {
            const nextKey = keys[i + 1];
            todaysMealsWithState[currentKey].eaten = true;
            await Storage.saveNextMealsToDB(todaysMealsWithState);

            return [todaysMealsWithState, nextKey];
        }

    }
    return [null, null];
}

function getNextMeal(todaysMealsWithState, nextKey) {
    return todaysMealsWithState[nextKey] || null;
}

function updateTodaysMeals(todaysMealsWithState) {

    const list = document.getElementById('todays-meals-container');

    if (list) {
        const keys = Object.keys(todaysMealsWithState);
        for (let i = 0; i < keys.length - 1; i++) {
            const currentKey = keys[i];

            for (const child of list.children) {

                let iteration = child.querySelector(".item-id").textContent;

                if (i === Number(iteration)) {
                    if (todaysMealsWithState[currentKey].eaten) {
                        child.querySelector(".check-point-db").classList.add("active");
                    } else {
                        child.querySelector(".check-point-db").classList.remove("active");
                    }
                }

            }
        }
    }

}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderNextMeal(nextMeal, currentKey) {
    if (!nextMeal) {
        renderCongratulations();
        return;
    }

    const congratsDiv = document.querySelector(".congratulations-message-db");

    if (congratsDiv) {

        congratsDiv.remove();

    }
    const nextMealContainer = document.querySelector(".next-meal-container");

    if (nextMealContainer) {
        nextMealContainer.innerHTML =
            `   <div class="card drop-shadow next-meal-card-db">
                <div class="first-row-db">
                    <input id="checked-circle" class="checkbox" type="checkbox">

                    <div class="next-meal-info">
                        <div class="next-meal-info-texts">
                            <h3 class="meal-name-db">${nextMeal.name}</h3>
                            <span class="subtext meal-category-h">${capitalizeFirstLetter(currentKey)}</span>
                        </div>

                        <span class="calories-db">
                        ${nextMeal.total_calories} kcal
                        </span>
                    </div>
                </div>

                <div class="nutrition-values-db">
                    <div class="nutrition-item-db">
                        <p class="nutrition-value-db">${nextMeal.total_protein}</p>
                        <p class="nutrition-label-db subtext">Protein</p>
                    </div>
                    <div class="nutrition-item-db">
                        <p class="nutrition-value-db">${nextMeal.total_carbs}</p>
                        <p class="nutrition-label-db subtext">Carbs</p>
                    </div>
                    <div class="nutrition-item-db">
                        <p class="nutrition-value-db">${nextMeal.total_fat}</p>
                        <p class="nutrition-label-db subtext">Fat</p>
                    </div>
                </div>
            </div>
        `
    }

    addCheckboxEventListener();
}

function renderTodaysMeals(todaysMealsWithState) {

    const list = document.getElementById('todays-meals-container');

    if (list && list.children.length === 0) {
        const keys = Object.keys(todaysMealsWithState);

        for (let i = 0; i < keys.length - 1; i++) {
            const currentKey = keys[i];
            list.appendChild(createMealCard(i, todaysMealsWithState, currentKey));
        }
    }

}

function createMealCard(i, todaysMealsWithState, currentKey) {

    let todaysMeal = todaysMealsWithState[currentKey];
    const card = document.createElement("li");
    card.className = "card drop-shadow mealcards-db";
    card.innerHTML = `<div class="check-point-db"></div>
                    <div class="todays-meal-info">
                        <span class="item-id">${i}</span>
                        <h3 class="meal-name-db">${todaysMeal.name}</h3>
                        <span class="subtext">${currentKey}</span>
                    </div>
                    <h3 class="todays-calories">${todaysMeal.total_calories} kcal</h3>`;

    return card;
}

function renderCongratulations() {

    const nextMealContainer = document.querySelector(".next-meal-container");
    const congratsExisting = document.querySelector('.congratulations-message-db');

    if (!congratsExisting) {
        nextMealContainer.innerHTML = `
        <div class="congratulations-message-db">     
            <span> Congratulations! 🎉</span>
            <span>You have achieved your goal!</span> 
            <button id="congrats-link">reset</button>
        </div>
        `;
        resetEventlistener();
    }

}

function resetEventlistener() {
    document.getElementById("congrats-link").addEventListener("click", async () => {


        let initialTodaysMealsWithState = await getTodaysMealsWithState(true);
        await Storage.saveNextMealsToDB(initialTodaysMealsWithState);

        // Sound.playCheckSound();

        // render first meal
        renderFirstUneatenMeal(initialTodaysMealsWithState);
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
                    <img class="user-tag-logo" src="./assets/icons/userRoleIcon${getRoleNumber(user.role)}.svg" alt="tag">
                    <span id="text-um${getRoleNumber(user.role)}" class="user-tag-text">${enumToDisplay(user.role)}</span>
                </div>
                <object id="change-role" src="./assets/icons/change-role.svg" alt="change role"></object>
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

async function deleteUser(user_id) {
    Storage.deleteUserFromDB(user_id);
    setTimeout(() => { }, 2000); // 750 ms verzögern
    console.warn("TOTAL USERS ARE BEING RENDERED AGAIN")
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
