import loadHome from "./js-pages/home.js";
import loadList from "./js-pages/list.js";
import loadPlan from "./js-pages/plan.js";
import loadMeals from "./js-pages/meals.js";
import loadSettings from "./js-pages/settings.js";
import * as Storage from "./storage.js";
import * as Auth from "./auth.js";
import * as Role from "./roleRouting.js";

const valid = await Auth.checkSessionTokenValid();
if (!valid) {
    console.warn(
        `[TokenCheck] ❌ Tokenprüfung fehlgeschlagen – Nutzer wird ausgeloggt11111111111`
    );
} else {
    console.log(`[TokenCheck] ✅ Alles in Ordnung11111111111111`);
}

// AUTHENTICATION
setInterval(async () => {
    console.log(`[TokenCheck] 🔄 Starte regelmäßige Prüfung...`);
    const valid = await Auth.checkSessionTokenValid();
    if (!valid) {
        console.warn(
            `[TokenCheck] ❌ Tokenprüfung fehlgeschlagen – Nutzer wird ausgeloggt`
        );
    } else {
        console.log(`[TokenCheck] ✅ Alles in Ordnung`);
    }
}, 5 * 60 * 1000); // alle 5 Minuten

// SERVICE-WORKER REGISTRATION
// The service worker registration code is currently disabled for debugging purposes.
// Uncomment the following block to enable service worker functionality.
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/sw.js')
//     .then((registration) => {
//       console.log('Service Worker registered successfully with scope:', registration.scope);
//     })
//     .catch((error) => {
//       console.error('Service Worker registration failed:', error);
//     });
// }

const routes = {
    home: loadHome,
    list: loadList,
    plan: loadPlan,
    meals: loadMeals,
    settings: loadSettings
};

function initialLoad() {
    Role.renderUserRoleColors();
    router();
}

initialLoad();

function setActiveTab() {
    const navLinks = document.querySelectorAll("#main-nav a");

    function setActiveFromHash() {
        const currentHash = window.location.hash;

        navLinks.forEach((link) => {
            if (link.getAttribute("href") === currentHash) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }

    // Setze beim Initialisieren sofort den aktiven Tab
    setActiveFromHash();

    // Reagiere global auf Hashänderungen
    window.addEventListener("hashchange", setActiveFromHash);
}


async function router() {
    // Wenn kein Hash vorhanden ist, setze "#home" als Standard
    if (!window.location.hash || window.location.hash === "") {
        window.history.replaceState(null, null, "#home");
    }

    const hash = window.location.hash.slice(1);

    // const baseTab = "initial Page to implement";
    const baseTab = loadHome;
    const loadPage = routes[hash] || baseTab;
    // document.getElementById('app').innerHTML = '';
    await loadPage();
    setActiveTab();
    if(hash !== "settings") {
        showNavbar();
    }
    console.log("Page loaded:", hash || "home");
}

window.addEventListener("hashchange", router);

// Lädt die Standardseite beim Start:
window.addEventListener("load", router);

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
    console.log("Daten aus storage.js:", data);
}

await loadData();

// EXAMPLE CALL FOR TESTING: (DB)
console.log("--------------DATA LOADED FROM DBBBBB-------------");
const dishes = await Storage.getDishes();
dishes.forEach((dish) => {
    console.log(`Dish Name: ${dish.name}`);
});

// EXAMPLE CALL FOR TESTING: (LS)
console.log("--------------DATA LOADED FROM LS LS LS-------------");
const dataLS = Storage.getDataLS();

const ingredients = dataLS.ingredients;

console.log(dataLS);
dataLS.dishes.forEach((dish) => {
    console.log(`Dish Name: ${dish.name}`);
});

// EXAMPLE CALL FOR TESTING: (DISHES WITH INGREDIENTS)
console.log("--------------DISHES WITH INGREDIENTS-------------");
const dishesWithIngredients = await Storage.getDishesWithIngredients();
console.log("HERE ARE THE FULL_DISHES:", dishesWithIngredients);

export function showNavbar() {
    const navbar = document.getElementById('main-nav');
    if (navbar) {
        navbar.style.display = 'flex';
    }
}