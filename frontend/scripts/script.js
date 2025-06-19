import loadHome from './js-pages/home.js';
import loadList from './js-pages/list.js';
import loadPlan from './js-pages/plan.js';
import loadMeals from './js-pages/meals.js';
import * as Storage from './storage.js';

// SERVICE-WORKER REGISTRATION
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('Service Worker registered successfully with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

const routes = {
    "home": loadHome,
    "list": loadList,
    "plan": loadPlan,
    "meals": loadMeals    
};

function router() {
    const hash = window.location.hash.slice(1);
    // Fallback auf Home-Seite
    const baseTab = "initial Page to implement";
    const loadPage = routes[hash] || baseTab;
    // Löscht vorherigen Inhalt
    // document.getElementById('app').innerHTML = '';
    loadPage();
    console.log('Page loaded:', hash || 'home');
}

window.addEventListener('hashchange', router);
// Lädt die Standardseite beim Start:
window.addEventListener('load', router);

// BACKEND-http-Request:
//
// export async function getDataDB() {
//     try {
//         console.log("trying to get API-data.....");
//         const response = await fetch('http://172.18.45.1:3000/dishes'); // API-Endpoint of Backend
//         console.log("API-data arrived...");
//         if (!response.ok) {
//             throw new Error(`HTTP-Error! Status: ${response.status}`);
//         }
//         const data = await response.json(); // get data of API
//         console.log('Daten abgerufen:', data); // Debugging
//         return data;
//     } catch (error) {
//         console.error('Fehler beim Abrufen der Daten:', error);
//     }
// }

 // --------------- LOAD ALL DATA --------------------
async function loadData() {
    const data = await Storage.getDataDB();
    console.log('Daten aus storage.js:', data);
}

await loadData();

// EXAMPLE CALL FOR TESTING: (DB)
console.log("--------------DATA LOADED FROM DBBBBB-------------");
const dishes = await Storage.getDishes();
dishes.forEach(dish => {
    console.log(`Dish Name: ${dish.name}`);
});

// EXAMPLE CALL FOR TESTING: (LS)
console.log("--------------DATA LOADED FROM LS LS LS-------------");
const dataLS = Storage.getDataLS();

const ingredients = dataLS.ingredients;

console.log(dataLS);
dataLS.dishes.forEach(dish => {
    console.log(`Dish Name: ${dish.name}`);
});
