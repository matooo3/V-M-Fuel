let currentWeekday = 0;
const weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];


// ./pages/plan.js
export default function loadPlan() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div id="plan">

            <nav id="weekday-nav">
                <button class="btn" id="weekdayDownBtn"><</button>
                <h1 id="weekday-tag">Montag</h1>
                <button class="btn" id="weekdayUpBtn">></button>
            </nav>
            
            <div id="parent-dish-container">
                <div class="dish-container">
                    <h2 class="dish-tag">breakfast</h2>

                </div>
                <div class="dish-container">
                    <h2 class="dish-tag">lunch</h2>

                </div>
                <div class="dish-container">
                    <h2 class="dish-tag">dinner</h2>

                </div>
                <div class="dish-container">
                    <h2 class="dish-tag">snacks</h2>

                </div>
                <div class="dish-container">
                    <h2 class="dish-tag">drinks</h2>
                </div>
            </div>
            
            
        </div> <!-- end-plan -->
    `;

    
    // implement current weekday meal plan
    const weekdayUpBtn = document.getElementById('weekdayUpBtn');
    const weekdayDownBtn = document.getElementById('weekdayDownBtn');
    
    let weekdayTag = document.getElementById('weekday-tag');
    

    weekdayUpBtn.addEventListener('click', () => {
        weekdayUp(weekdays, weekdayTag);
    });
    weekdayDownBtn.addEventListener('click', () => {
        weekdayDown(weekdays, weekdayTag);
    });

}


function weekdayUp(weekdays, weekdayTag) {
    
    currentWeekday++;
    if (currentWeekday > 6) {
        currentWeekday = 0;
    }
    weekdayTag.innerHTML = weekdays[currentWeekday];
    loadDishes();
}

function weekdayDown(weekdays, weekdayTag) {
    
    currentWeekday--;
    if (currentWeekday < 0) {
        currentWeekday = 6;
    }
    weekdayTag.innerHTML = weekdays[currentWeekday];
    loadDishes();
}   

function loadDishes() {

}


