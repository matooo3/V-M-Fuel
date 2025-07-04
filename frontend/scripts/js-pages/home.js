// ./pages/home.js

import { loadHTMLTemplate } from '../templateLoader.js';

export default async function loadHome() {
    const app = document.getElementById('app');
    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/home.html');
    app.innerHTML = html;
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

    // add event listener to settings class
    const settingsButton = document.querySelector('.settings');
    if (settingsButton) {
        settingsButton.addEventListener('click', function () {
            window.location.href = '/frontend/html-pages/settings.html';
        });
    }

}



function updateAdminContainer() {
    const activeTab = document.querySelector('.tab.active');
    const adminContainer = document.getElementById('admin-container');

    if (activeTab && activeTab.textContent.trim() === 'Standard') {
        adminContainer.innerHTML = `<div class="progress-wrapper">
            <svg class="progress-svg" viewBox="0 0 200 200">
                <circle class="progress-circle-background" cx="100" cy="100" r="90"></circle>
                <circle class="progress-bar" cx="100" cy="100" r="90"></circle>
            </svg>
            <div class="progress-text">1000 ckal</div>
        </div>

        <div id="next-meals">
            <span id="next-meal-text">Next meal</span>

            <div class="meals-info-db">
                <div class="card drop-shadow next-meal-card-db">
                    <div class = "first-row-db">
                        <input id="checked-circle" class="checkbox" type="checkbox">

                        <div class ="next-meal-info">
                            <div class="next-meal-info-texts">
                                <h3 class="meal-name">Chili con carne</h3>
                                <span class="subtext">Lunch</span>
                            </div>

                            <span class="calories-db">
                                830kcal
                            </span>
                        </div>
                    </div>

                    <div class="nutrition-values-db">
                        <div class="nutrition-item-mp">
                            <p class="nutrition-value-mp">11g</p>
                            <p class="nutrition-label-mp subtext">Protein</p>
                        </div>
                        <div class="nutrition-item-mp">
                            <p class="nutrition-value-mp">22.8g</p>
                            <p class="nutrition-label-mp subtext">Carbs</p>
                        </div>
                        <div class="nutrition-item-mp">
                            <p class="nutrition-value-mp">0.3g</p>
                            <p class="nutrition-label-mp subtext">Fat</p>
                        </div>
                    </div>
                </div>

                <div id="info-stats-db">
                    <div id="planned" class="card drop-shadow">
                        <h1 class="meals-amount-db">4</h1>
                        <p class="subtext">Meals planned</p>
                    </div>
                    <div id="eaten" class="card drop-shadow">
                        <h1 class="meals-amount-db">36%</h1>
                        <p class="subtext">daily goal</p>
                    </div>
                </div>

                <span id="todays-meals-text">Today's meals</span>

                <div id="todays-meals-container">
                    <div class="card drop-shadow mealcards-db">
                        <div class="red-point-db"></div>
                        <div class="todays-meal-info">
                            <h3 class="meal-name-db">Breakfast</h3>
                            <span class="subtext">Avocado Toast with Eggs</span>
                        </div>
                        <h3 class="todays-calories">420ckal</h3>
                    </div>
                    <div class="card drop-shadow mealcards-db">
                        <div class="red-point-db"></div>
                        <div class="todays-meal-info">
                            <h3 class="meal-name-db">Lunch</h3>
                            <span class="subtext">Chili con carne</span>
                        </div>
                        <h3 class="todays-calories">820ckal</h3>
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
                <div id="search-bar-db">
                    <img id="search-icon-db" src="/frontend/assets/icons/search-icon.svg" alt="search icon">
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
                            <img class="user-tag-logo" src="/frontend/assets/icons/admin-tag.svg" alt="tag">
                            <span class="user-tag-text">Admin</span>
                        </div>
                        <img id="change-role" src="/frontend/assets/icons/change-role.svg" alt="change role">
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
                            <img class="user-tag-logo" src="/frontend/assets/icons/admin-tag.svg" alt="tag">
                            <span class="user-tag-text">Admin</span>
                        </div>
                        <img id="change-role" src="/frontend/assets/icons/change-role.svg" alt="change role">
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




