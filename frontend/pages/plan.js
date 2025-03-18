let currentWeekday = 0;
const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];


// ./pages/plan.js
export default function loadPlan() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div id="plan">

            <nav id="weekday-nav">
                <button class="btn" id="weekdayDownBtn"><</button>
                <h1 id="weekday-tag">monday</h1>
                <button class="btn" id="weekdayUpBtn">></button>
            </nav>
            
            <div id="parent-dish-container">
                <div class="dish-container">
                    <h2 class="dish-tag">breakfast</h2>
                    <div id="meal1">meal1</div>
                </div>
                <div class="dish-container">
                    <h2 class="dish-tag">lunch</h2>
                    <div id="meal2">meal2</div>
                </div>
                <div class="dish-container">
                    <h2 class="dish-tag">dinner</h2>
                    <div id="meal3">meal3</div>
                </div>
                <div class="dish-container">
                    <h2 class="dish-tag">snacks</h2>
                    <div id="meal4">meal4</div>
                </div>
                <div class="dish-container">
                    <h2 class="dish-tag">drinks</h2>
                    <div id="meal5">meal5</div>
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

// dictionary, for each day: breakfast, lunch, dinner, snacks, drinks
// get data from main-algorith

function loadDishes() {
    // dummy-values for now:
    const meal1 = document.getElementById('meal1');
    const meal2 = document.getElementById('meal2');
    const meal3 = document.getElementById('meal3');
    const meal4 = document.getElementById('meal4');
    const meal5 = document.getElementById('meal5');

    meal1.innerHTML = 'testMeal1';
    meal2.innerHTML = 'testMeal2';
    meal3.innerHTML = 'testMeal3';
    meal4.innerHTML = 'testMeal4';
    meal5.innerHTML = 'testMeal5';

}


