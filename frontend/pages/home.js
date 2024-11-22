// ./pages/home.js
export default function loadHome() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div id="home">
            <!-- USER INPUT: -->

            <div id="input-container">
                
                <label class="top-el" for="kg">Gewicht:</label>
                <input type="number" id="kg" placeholder="kg" min="0">

                <label class="top-el" for="cm">Größe:</label>
                <input type="number" id="cm" placeholder="cm" min="0">

                <label for="age">Alter:</label>
                <input type="number" id="age" placeholder="Jahre" min="0">

                <label class="top-el" for="gender">Geschlecht:</label>
                <select class="btn" name="gender" id="gender">
                    <option value="male">männlich</option>
                    <option value="female">weiblich</option>
                </select>

                <label class="top-el" for="activity">Aktivitätslevel:</label>
                <select class="btn" name="activity" id="activity">
                    <option value="1.2">keine Aktivität</option>
                    <option value="1.375">leicht aktiv</option>
                    <option value="1.55">mäßig aktiv</option>
                    <option value="1.725">sehr aktiv</option>
                    <option value="1.9">extrem aktiv</option>
                </select>

                <label for="goal">Ziel:</label>
                <select class="btn" name="goal" id="goal">
                    <option value="bulk">Bulk</option>
                    <option value="maintain">Gewicht halten</option>
                    <option value="cut">Cut</option>
                </select>
                
                <div id="result-kcal">
                    Test
                </div>

            </div>

                <!-- Dropdownmenu to change default / kcal here: -->
                <select class="btn" id="calc-mode-btn">
                    <option value="default">default</option>
                    <option value="kcal">kcal</option>
                </select>
            
                <button class="btn" id="calc-btn">calc</button> 
            
        
        </div> <!-- end-home -->
    `;

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

// kcal calculate Funktion
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


