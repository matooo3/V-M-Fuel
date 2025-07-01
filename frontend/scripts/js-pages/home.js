// ./pages/home.js

import { loadHTMLTemplate } from '../templateLoader.js';

export default async function loadHome() {
    const app = document.getElementById('app');
    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/home.html');
    app.innerHTML = html;
    updateAdminContainer();

    function updateAdminContainer() {
        const activeTab = document.querySelector('.tab.active');
        const adminContainer = document.getElementById('admin-container');

        if (activeTab && activeTab.textContent.trim() === 'Standard') {
            adminContainer.innerHTML = `<div class="progress-wrapper">
            <svg class="progress-svg" viewBox="0 0 200 200">
                <circle class="progress-circle-background" cx="100" cy="100" r="90"></circle>
                <circle class="progress-bar" cx="100" cy="100" r="90"></circle>
            </svg>
            <div class="progress-text">36.1%</div>
        </div>

        <div id="next-meals">
            <span id="next-meal-text">Next meal</span>

            <div id="meals-info">
                <div id="next-meal-card" class="card drop-shadow">
                    <input id="checked-circle" class="checkbox" type="checkbox">

                    <div id="next-meal-info">
                        <div id="next-meal-info-texts">
                            <h3 class="meal-name">Chili con carne</h3>
                            <span class="subtext">Lunch</span>
                        </div>

                        <div class="nutrition-info">
                            <div class="nutrition-item">
                                <p class="nutrition-value">1.1g</p>
                                <p class="subtext nutrition-text">Protein</p>
                            </div>

                            <div class="nutrition-item">
                                <p class="nutrition-value">22.8g</p>
                                <p class="subtext nutrition-text">Carbs</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="info-stats">
                    <div id="planned" class="card drop-shadow">
                        <h1 class="meals-amount">4</h1>
                        <p class="subtext">Meals planned</p>
                    </div>
                    <div id="eaten" class="card drop-shadow">
                        <h1 class="meals-amount">1</h1>
                        <p class="subtext">eaten meals</p>
                    </div>
                </div>

                <span id="todays-meals-text">Today's meals</span>

                <div id="todays-meals-container">
                    <div class="card drop-shadow mealcards">
                        <div class="red-point"></div>
                        <div id="todays-meal-info">
                            <h3 class="meal-name">Breakfast</h3>
                            <span class="subtext">Avocado Toast with Eggs</span>
                        </div>
                        <h3 id="todays-calories">420ckal</h3>
                    </div>
                    <div class="card drop-shadow mealcards">
                        <div class="red-point"></div>
                        <div id="todays-meal-info">
                            <h3 class="meal-name">Lunch</h3>
                            <span class="subtext">Chili con carne</span>
                        </div>
                        <h3 id="todays-calories">820ckal</h3>
                    </div>                                  
                </div>
            </div>
        </div>`;
        } else {
            adminContainer.innerHTML = `
            <div id="user-managment-container">
            <div id="user-info">
                <h1 id="user-text">User management</h1>
                <div id="user-amount">
                    <span class="subtext meals-amount-text">Total users</span>
                    <div id="user-red-point"></div>
                    <span class="subtext meals-amount-text">500</span>
                </div>
                <div id="search-bar">
                    <img id="search-icon" src="/frontend/assets/icons/search-icon.png" alt="search icon">
                    <input type="text" placeholder="Search User">
                </div>
            </div>
            <div id="user-list">
                <div class="card user">
                    <div class="profile-picture">
                        <span>DM</span>
                    </div>
                    <div class="user-data">
                        <span class="user-name">Daniel Mehler</span>
                        <span class="user-email">daniel.mehler@gmail.com</span>
                    </div>
                    <div id="user-role">
                        <div class="user-tag">
                            <img class="user-tag-logo" src="/frontend/assets/icons/admin-tag.png" alt="tag">
                            <span class="user-tag-text">Admin</span>
                        </div>
                        <img id="change-role" src="/frontend/assets/icons/change-role.png" alt="change role">
                    </div>
                </div>
                <div class="card user">
                    <div class="profile-picture">
                        <span>DM</span>
                    </div>
                    <div class="user-data">
                        <span class="user-name">Daniel Mehler</span>
                        <span class="user-email">daniel.mehler@gmail.com</span>
                    </div>
                    <div id="user-role">
                        <div class="user-tag">
                            <img class="user-tag-logo" src="/frontend/assets/icons/admin-tag.png" alt="tag">
                            <span class="user-tag-text">Admin</span>
                        </div>
                        <img id="change-role" src="/frontend/assets/icons/change-role.png" alt="change role">
                    </div>
                </div>
                <div class="card user">
                </div>
                <div class="card user">
                </div>
                <div class="card user">
                </div>
                <div class="card user">
                </div>
                <div class="card user">
                </div>
                <div class="card user">
                </div>
                <div class="card user">
                </div>
                <div class="card user">
                </div>
                <div class="card user">
                </div>
                <div class="card user">
                </div>
                <div class="card user">
                </div>
                <div class="card user">
                </div>
            </div>
        </div>`;
        }
    }

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


}



