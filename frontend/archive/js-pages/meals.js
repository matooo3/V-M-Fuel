// ./pages/meals.js
import { loadHTMLTemplate } from '../templateLoader.js';

export default async function loadMeals() {
    const app = document.getElementById('app');
    
    try {
        const data = await getDataDB(); // Abrufen der Daten von der Backend-API
        if (!data || data.length === 0) {
            app.innerHTML = '<p>Keine Gerichte gefunden.</p>';
            return;
        }
        
        // Die Gerichte als Liste anzeigen
        app.innerHTML = `
            <h1>Meals</h1>
            <p>Willkommen auf der Meals-Seite!</p>
            <ul>
                ${data.map(meal => `
                    <li> 
                        <strong>${meal.name}</strong><br>
                        Kalorien: ${meal.calories}<br>
                        Protein: ${meal.protein}g<br>
                        Carbs: ${meal.carbs}g<br>
                        Fette: ${meal.fats}g<br>
                        VM Score: ${meal.vm_score}<br>
                        Kategorie: ${meal.meal_category}
                    </li>
                `).join('')}
            </ul>
        `;
    } catch (error) {
        app.innerHTML = '<p>Fehler beim Laden der Gerichte.</p>';
        console.error('Fehler beim Laden der Gerichte:', error);
    }
}

async function getDataDB() {
    try {
        // Anfrage an das Backend
        // const response = await fetch('http://172.18.45.1:3000/dishes'); // direct to backend
        const response = await fetch('https://gfoh.ddns.net:6969/api/dishes'); // via reverse proxy
        if (!response.ok) {
            throw new Error(`Fehler: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Daten vom Backend:', data); // Zum Debuggen
        return data;
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
    }
}
