// ./pages/meals.js
import { getData } from '../scripts/script.js';

export default async function loadMeals() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>Meals</h1>
        <p>Willkommen auf der Meals-Seite!</p>
        <ul id="meal-list"></ul>
    `;

    try {
        const data = await getData(); // Daten abrufen
        const mealList = document.getElementById('meal-list');
        data.forEach(meal => {
            const listItem = document.createElement('li');
            listItem.textContent = `${meal.name} - ${meal.price}€`; // Beispielhafte Darstellung
            mealList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Fehler beim Laden der Gerichte:', error);
    }
}
