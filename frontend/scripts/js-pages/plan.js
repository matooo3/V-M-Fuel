import { loadHTMLTemplate } from '../templateLoader.js';

let currentWeekday = 0;
const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// ./pages/plan.js
export default async function loadPlan() {
    const app = document.getElementById('app');
    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/plan.html');
    app.innerHTML = html;

    
    // implement current weekday meal plan
    const weekdayUpBtn = document.getElementById('weekdayUpBtn');
    const weekdayDownBtn = document.getElementById('weekdayDownBtn');
    
    let weekdayTag = document.getElementById('weekday-tag');
    loadDishes();

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

// Centralized meal data
const weeklyMeals = {
    0: ["Müsli", "Spaghetti", "Pizza", "Apfel", "Wasser"],                        
    1: ["Joghurt", "Pasta Bolognese", "Chili con Carne", "Nüsse", "Fanta"],      
    2: ["Porridge", "Risotto", "Sushi", "Banane", "Kaffee"],                     
    3: ["Toast", "Käsespätzle", "Curry", "Möhrensticks", "Tee"],                
    4: ["Croissant", "Burger", "Lasagne", "Trauben", "Cola"],                   
    5: ["Rührei", "Falafel", "Tacos", "Mandarinen", "Limo"],                    
    6: ["Pfannkuchen", "Suppe", "Braten", "Matze's Mom", "Saft"],                     
};


function loadDishes() {
    const meals = getMealsHtml();
    const dailyMeals = weeklyMeals[currentWeekday];

    meals.forEach((mealElement, index) => {
        mealElement.innerHTML = dailyMeals[index];
    });
}

function getMealsHtml() {
    return [
        document.getElementById('breakfast'),
        document.getElementById('lunch'),
        document.getElementById('dinner'),
        document.getElementById('snacks'),
        document.getElementById('drinks')
    ];
}


