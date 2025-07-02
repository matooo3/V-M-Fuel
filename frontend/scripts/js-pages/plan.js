import { loadHTMLTemplate } from '../templateLoader.js';


// Integration into your loadPlan function:
export default async function loadPlan() {
    const app = document.getElementById('app');
    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/plan.html');
    app.innerHTML = html;
    
    // Initialize calendar after HTML is loaded
    initializeCalendar();
}

// Get current date and calculate current week
function getCurrentWeekData() {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    
    return { today, currentDay, currentMonth, currentYear, monthNames };
}

// Calculate the current week (Monday to Sunday)
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

// Update month/year display
function updateMonthYearDisplay(monthNames, currentMonth, currentYear) {
    const monthYearElement = document.getElementById('monthYear');
    if (monthYearElement) {
        monthYearElement.innerHTML = `${monthNames[currentMonth]}<br>${currentYear}`;
    }
}

// Generate day content data
function generateDayContent(currentWeek) {
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Content for each day of the week
    const weeklyContent = {
        monday: `        <div class="card drop-shadow plan-meal-card">
            <div class="meal-header-mp">
                <div>
                    <h3 class="meal-title-mp">Breakfast</h3>
                    <p class="subtext">Avocado Toast with Eggs</p>
                </div>
                <div class="meal-calories-mp">420 ckal</div>
            </div>

            <div class="nutrition-values-mp">
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
                <div class="nutrition-item-mp">
                    <p class="nutrition-value-mp">10</p>
                    <p class="nutrition-label-mp subtext">VM score</p>
                </div>
            </div>

            <div class="meal-details-mp">
                <div class="footer-mp">
                    <img class="clock-logo-mp" src="/frontend/assets/icons/clock.png" alt="clock">
                    <p class="footer-text-mp">10 min</p>
                </div>
                <div class="footer-mp">
                    <img class="users-logo-mp" src="/frontend/assets/icons/users.png" alt="users">
                    <p class="footer-text-mp">1 serving</p>
                </div>
            </div>
        </div>
        <div class="card drop-shadow plan-meal-card">
            <div class="meal-header-mp">
                <div>
                    <h3 class="meal-title-mp">Breakfast</h3>
                    <p class="subtext">Avocado Toast with Eggs</p>
                </div>
                <div class="meal-calories-mp">420 ckal</div>
            </div>

            <div class="nutrition-values-mp">
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
                <div class="nutrition-item-mp">
                    <p class="nutrition-value-mp">10</p>
                    <p class="nutrition-label-mp subtext">VM score</p>
                </div>
            </div>

            <div class="meal-details-mp">
                <div class="footer-mp">
                    <img class="clock-logo-mp" src="/frontend/assets/icons/clock.png" alt="clock">
                    <p class="footer-text-mp">10 min</p>
                </div>
                <div class="footer-mp">
                    <img class="users-logo-mp" src="/frontend/assets/icons/users.png" alt="users">
                    <p class="footer-text-mp">1 serving</p>
                </div>
            </div>
        </div>
        <div class="card drop-shadow plan-meal-card">
            <div class="meal-header-mp">
                <div>
                    <h3 class="meal-title-mp">Breakfast</h3>
                    <p class="subtext">Avocado Toast with Eggs</p>
                </div>
                <div class="meal-calories-mp">420 ckal</div>
            </div>

            <div class="nutrition-values-mp">
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
                <div class="nutrition-item-mp">
                    <p class="nutrition-value-mp">10</p>
                    <p class="nutrition-label-mp subtext">VM score</p>
                </div>
            </div>

            <div class="meal-details-mp">
                <div class="footer-mp">
                    <img class="clock-logo-mp" src="/frontend/assets/icons/clock.png" alt="clock">
                    <p class="footer-text-mp">10 min</p>
                </div>
                <div class="footer-mp">
                    <img class="users-logo-mp" src="/frontend/assets/icons/users.png" alt="users">
                    <p class="footer-text-mp">1 serving</p>
                </div>
            </div>
        </div>`,
        tuesday: `<div class="card drop-shadow plan-meal-card">
            <div class="meal-header-mp">
                <div>
                    <h3 class="meal-title-mp">Breakfast</h3>
                    <p class="subtext">Avocado Toast with Eggs</p>
                </div>
                <div class="meal-calories-mp">420 ckal</div>
            </div>

            <div class="nutrition-values-mp">
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
                <div class="nutrition-item-mp">
                    <p class="nutrition-value-mp">10</p>
                    <p class="nutrition-label-mp subtext">VM score</p>
                </div>
            </div>

            <div class="meal-details-mp">
                <div class="footer-mp">
                    <img class="clock-logo-mp" src="/frontend/assets/icons/clock.png" alt="clock">
                    <p class="footer-text-mp">10 min</p>
                </div>
                <div class="footer-mp">
                    <img class="users-logo-mp" src="/frontend/assets/icons/users.png" alt="users">
                    <p class="footer-text-mp">1 serving</p>
                </div>
            </div>
        </div>`,
        wednesday: "Placeholder 2",
        thursday: "Placeholder 3",
        friday: "Placeholder 4",
        saturday: "Placeholder 5",
        sunday: "Placeholder 6",
    };
    
    // Map the weekly content to actual dates
    const dayContent = {};
    currentWeek.forEach((date, index) => {
        const dayName = dayNames[index];
        const dayNumber = date.getDate();
        dayContent[dayNumber] = weeklyContent[dayName];
    });
    
    return dayContent;
}

// Create and populate the days grid
function populateDaysGrid(currentWeek, today, currentMonth) {
    const daysGrid = document.getElementById('daysGrid');
    if (!daysGrid) return;
    
    daysGrid.innerHTML = ''; // Clear existing content
    
    currentWeek.forEach(date => {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = date.getDate();
        dayElement.setAttribute('data-day', date.getDate());
        dayElement.setAttribute('data-month', date.getMonth());
        dayElement.setAttribute('data-year', date.getFullYear());
        
        // Mark today as selected
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('selected');
        }

        // Style days from other months differently
        if (date.getMonth() !== currentMonth) {
           dayElement.classList.add('other-month'); 
        }
        
        daysGrid.appendChild(dayElement);
    });
}

// Update content display
function updateContent(day, dayContent) {

    const content = dayContent[day]
    const section = document.getElementById('content-section');
    section.innerHTML = content;

}

// Add event listeners to day elements
function addDayEventListeners(dayContent) {
    document.querySelectorAll('.day').forEach(dayElement => {
        dayElement.addEventListener('click', function() {
            document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));

            this.classList.add('selected');
            
            const day = parseInt(this.getAttribute('data-day'));
            updateContent(day, dayContent);
        });
    });
}

// Initialize the calendar
function initializeCalendar() {
    const { today, currentDay, currentMonth, currentYear, monthNames } = getCurrentWeekData();
    const currentWeek = calculateCurrentWeek(today);
    
    updateMonthYearDisplay(monthNames, currentMonth, currentYear);
    populateDaysGrid(currentWeek, today, currentMonth);
    
    const dayContent = generateDayContent(currentWeek, currentDay);
    updateContent(currentDay, dayContent);
    addDayEventListeners(dayContent);
}
