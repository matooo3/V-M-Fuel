// ./pages/home.js

import { loadHTMLTemplate } from '../templateLoader.js';
import * as Storage from '../storage.js';
import * as Auth from '/frontend/scripts/auth.js';
import * as Swipe from '../swipetodelete.js';
import * as Role from '../roleRouting.js';
import * as Settings from './settings.js';
import * as Search from '../searchBar.js'


export default async function loadHome() {
    const app = document.getElementById('app');
    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/home.html');
    app.innerHTML = html;

    //load user greeting! (eventlistener DOM loaded)
    // document.addEventListener('DOMContentLoaded', renderUserGreeting);

    Role.renderAdminPanel();
    Role.renderUserRoleColors();

    updateAdminContainer();

    // Eventlistener: -------------------------------------------
    // DOM-Manipulation:

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


    // Settings Event Listener
    Settings.loadSettingsEventListener();

    setTimeout(() => {
        renderUserGreeting();
    }, 1);

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
        Swipe.initializeSwipeToDelete(userListContainer, '.card.user', nothing);

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

function nothing() {

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
