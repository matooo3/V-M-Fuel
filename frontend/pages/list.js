// ./pages/list.js
export default function loadList() {
    const app = document.getElementById('app');
    app.innerHTML = `
            <ol class="checklist">
                <li>
                    <label>
                        <input type="checkbox">
                        <span class="bullet"></span> Apfel
                    </label>
                </li>
            </ol> 

            <select class="btn" id="order-btn">
                <option value="food categories">food categories</option>
                <option value="alphabetic">alphabetic</option>
            </select>
            <button class = "btn" id = "update-button"> Generate </button>
    `;

// Event Listener hinzufügen
document.getElementById("update-button").addEventListener("click", () => {

    // function for getting the right food from data base still needs to be implemented!!
    const array = ["Apfel", "Gurke", "Banane"]
    // TODO

    updateList(array)
});

// Event Listener for Dropdown-Button
document.getElementById("order-btn").addEventListener("change", (event) => {
    
    const orderType = event.target.value;

    // getting current entries
    const items = Array.from(document.querySelectorAll(".checklist li label"))
        .map(label => label.textContent.trim()); // trim is not necessary right now, but will be necessary if the user is able to edit the list

    if (orderType === "food categories") {

        // TODO
        // sorting according to certain food categroies

    }

    if (orderType === "alphabetic") {

        // sorting alphabetically
        updateList(items.sort());

    }
});

}

    // Funktion zum Aktualisieren der Liste
    function updateList(array) {

        const sort_val = document.getElementById("order-btn").value;

        if (sort_val === "food categories") {

            // TODO
            // sorting according to certain food categroies
    
        }
    
        if (sort_val === "alphabetic") {
    
            array.sort();
    
        }
    
        const checklist = document.querySelector('.checklist');
    
        // Alte Einträge entfernen
        checklist.innerHTML = '';
    
        // Neue Einträge hinzufügen
        array.forEach((item) => {
            // Neues Listenelement erstellen
            const li = document.createElement('li');
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            const bullet = document.createElement('span');
            bullet.className = 'bullet';
            const text = document.createTextNode(` ${item}`);
    
            // Zusammenfügen der Elemente
            label.appendChild(checkbox);
            label.appendChild(bullet);
            label.appendChild(text);
            li.appendChild(label);
            checklist.appendChild(li);
        });
    }
