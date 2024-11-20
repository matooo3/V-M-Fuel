// ./pages/home.js
export default function loadHome() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div id="home">
            <h2>home</h2>
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
                    <option value="männlich">männlich</option>
                    <option value="weiblich">weiblich</option>
                </select>

                <label class="top-el" for="activity">Aktivitätslevel:</label>
                <select class="btn" name="activity" id="activity">
                    <option value="1.2">keine Aktivität</option>
                    <option value="1.375">leicht aktiv</option>
                    <option value="1.55">mäßig aktiv</option>
                    <option value="1.725">sehr aktiv</option>
                    <option value="1.9">extrem aktiv</option>
                </select>
                
                </div>

                <!-- Dropdownmenu to change default / kcal here: -->
                <select class="btn" id="calc-mode-btn">
                    <option value="default">default</option>
                    <option value="kcal">kcal</option>
                </select>
            
                <button class="btn" id="calc-btn">calc</button> 
            
        
        </div> <!-- end-home -->
    `;
}

// kcal berechnen Funktion
export function calcKcal() {
    
    const kg = document.getElementById('kg').value;
    const cm = document.getElementById('cm').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const activity = document.getElementById('activity').value;

}