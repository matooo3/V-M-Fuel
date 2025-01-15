// ./pages/list.js
let items = getData();
let counter = 0;

export default function loadList() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="meal-container">
        <div class="header">
            <select id="order-btn" class="meal-btn">
                <option value="food categories">Food Categories</option>
                <option value="alphabetic">Alphabetic</option>
            </select>
            <button id="generate-btn" class="meal-btn">Generate</button>
        </div>
        <ul class="checklist">

        </ul>
        <div class="add-more">Add More Items
            <div id="add-more-inputs">
                <input type="text" id="new-items" placeholder="Enter items, separated by commas">
                <button id="add-button" class="meal-btn">Add</button>
            </div>
        </div>
    `;

// Add event listener
document.getElementById("generate-btn").addEventListener("click", () => {

    updateList(items);

});

// Add event listener for Dropdown-Button
document.getElementById("order-btn").addEventListener("change", () => {
 
    sort_items();
        
});

document.querySelector(".add-more").addEventListener("click", () => {

    counter += 1;
    display_addmore(counter);

});

document.getElementById("new-items").addEventListener("click", (event) => {

    event.stopPropagation(); // Prevents that klicking hides the input field always

});

document.getElementById("add-button").addEventListener("click", () => {

    add_items();

});

}

function getData(){

    // Get Data from database - TODO
    return ["Gurke", "Apfel", "Banane"];

}

function updateList(items) {


    const checklist = document.querySelector(".checklist");

    checklist.innerHTML = "";
    items.forEach(item => {

        const li = document.createElement("li");
        li.innerHTML = `
            <label class="label">
                <input class="input" type="checkbox">
                <span class="bullet"></span>
                ${item}
            </label>
        `;
        checklist.appendChild(li);

    });

}

function sort_items(){
        
    const sort_val = document.getElementById("order-btn").value

        if (sort_val === "food categories") {

            // TODO
            // sorting according to certain food categroies
        }
    
        if (sort_val === "alphabetic") {
            
            items.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); // lower case variants are getting compared
            updateList(items);
    
        }

}


function display_addmore(counter){

    const inputsDiv = document.getElementById("add-more-inputs");

    if(counter % 2 == 0){

        inputsDiv.style.display = "none";

    } else {

        inputsDiv.style.display = "block";

    }

}

function add_items(){
    
    const newItemsInput = document.getElementById("new-items");
    const newItems = newItemsInput.value.split(",").map(item => item.trim()).filter(item => item);

    if (newItems.length > 0) {

        for(let i = 0; i < newItems.length; i++){
            
            items.push(newItems[i]);

        }
        
        sort_items();
        updateList(items);
        newItemsInput.value = ""; // Empty input field
        document.getElementById("add-more-inputs").style.display = "none"; // Hide input field

    } else {

        alert("Please enter at least one item.");

    }
}
