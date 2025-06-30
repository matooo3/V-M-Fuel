// ./pages/home.js

import { loadHTMLTemplate } from '../templateLoader.js';

export default async function loadHome() {
    const app = document.getElementById('app');
    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/home.html');
    app.innerHTML = html;
    // updateAdminContainer();

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
            adminContainer.innerHTML = '';
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

    const mealsInfo = document.getElementById('meals-info');
    const nextMealText = document.getElementById('next-meal-text');

    mealsInfo.addEventListener('scroll', () => {
        if (mealsInfo.scrollTop > 0) {
            // Gescrollt - Margin entfernen
            nextMealText.style.marginBottom = '0px';
        } else {
            // Ganz oben - Original Margin wiederherstellen
            nextMealText.style.marginBottom = '20px'; // Dein ursprünglicher Wert
        }
    });


}



