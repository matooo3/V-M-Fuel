// ./pages/home.js
export default function loadHome() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div id="home">
            <h2>home</h2>
            <!-- USER INPUT: -->

            <div id="input-container">
                <label for="kg">Körpergewicht</label>
                <input type="number" id="kg" placeholder="kg" min="0">

                <input type="number" id="cm" placeholder="cm" min="0">

                <!-- Dropdownmenu to change default or kcal here: -->
                <select class="btn" id="calc-mode-btn">
                    <option value="default">default</option>
                    <option value="kcal">kcal</option>
                </select>
            
                <button class="btn" id="calc-btn">calc</button> 
            </div>
        
        </div> <!-- end-home -->
    `;
}
