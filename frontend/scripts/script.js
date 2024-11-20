import loadHome from '../pages/home.js';
import loadList from '../pages/list.js';
import loadPlan from '../pages/plan.js';
import loadMeals from '../pages/meals.js';

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




