// ./pages/home.js

import { loadHTMLTemplate } from '../templateLoader.js';

export default async function loadHome() {
    const app = document.getElementById('app');
    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/home.html');
    app.innerHTML = html;

    // Eventlistener: -------------------------------------------

    // DOM-Manipulation:
    // document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('calc-btn').addEventListener('click', () => {
            const bmr = calcKcal();
            const result = document.getElementById('result-kcal');
            result.textContent = bmr + " kcal";
        });
    // });

}

////////////////////////////////////////////////////////////////
//               HOME-CALCULATE-KCAL-FUNCTION                 //
////////////////////////////////////////////////////////////////

// kcal berechnen Funktion
function calcKcal() {

    const calcMode = document.getElementById('calc-mode-btn').value;
    let kg = document.getElementById('kg').value;
    let cm = document.getElementById('cm').value;
    let age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const activity = parseFloat(document.getElementById('activity').value);
    const goal = document.getElementById('goal').value;

    // defaults:
    if (!kg) {
        kg = 70;
    }

    if (!cm) {
        cm = 180;
    }

    if (!age) { 
        age = 30;
    }
    

    let bmr = 0;

    switch(goal){
        case "bulk":
            // Bulk (Miffilin):
            bmr = mifflinStJeor(kg, cm, age, gender);
            bmr += 200;
            break;
        case "maintain":
            // Maintain (Miffilin):
            bmr = (mifflinStJeor(kg, cm, age, gender) + harrisBenedict(kg, cm, age, gender)) / 2;
            bmr *= 1;
            break;
        case "cut":
            // Cut (Harris):
            bmr = harrisBenedict(kg, cm, age, gender);
            bmr -= 200;
            break;
    }

    return Math.round(bmr * activity);

}

// Mifflin-St Jeor Formel (Bulk / default)
function mifflinStJeor(weight, height, age, gender) {
    switch(gender) {
        case "male":
            return 10 * weight + 6.25 * height - 5 * age + 5;
        case "female":
            return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}

// Harris-Benedict Formel (Cut)
function harrisBenedict(weight, height, age, gender) {
    switch(gender) {
        case "male":
            return 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age);
        case "female":
            return 447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age);
    }
}


