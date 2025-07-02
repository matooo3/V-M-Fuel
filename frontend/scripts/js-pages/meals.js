// ./pages/meals.js
import { loadHTMLTemplate } from '../templateLoader.js';

// Main function
export default async function loadMeals() {
    const app = document.getElementById('app');
    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/meals.html');
    app.innerHTML = html;

    const filterButtons = document.querySelectorAll('#filter-bar-p button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            setActiveFilterButton(button);
        });
    });

}

// -----------------------------------------------------------
// active class for BUTTONS in filter-bar
// -----------------------------------------------------------

function setActiveFilterButton(button) {
    const buttons = document.querySelectorAll('#filter-bar-p button');
    buttons.forEach(btn => {
        if (btn === button) {
            btn.classList.add('active-p');
            btn.classList.remove('notActive-p');
        } else {
            btn.classList.remove('active-p');
            btn.classList.add('notActive-p');
        }
    });
}
