// ./pages/list.js
let items = getData();
let counter = 0;

export default function loadList() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="meal-container">
        <div class="meal-header">
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
                <button class="meal-btn delete-button">delete</button>
            </label>
        `;
        checklist.appendChild(li);

    });

    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            delete_item(event);
        });
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

function delete_item(event){

    const checklist = document.querySelector(".checklist");
    console.log(checklist)
    const listItem = event.target.closest("li"); // Gets the parent <li> of the button
    listItem.remove(); // Removes the <li> element from the DOM
    console.log(checklist)

    // Remove element from array
    const itemText = listItem.querySelector("span").textContent.trim(); 
    const index = items.indexOf(itemText); // Returns -1 if the index doesnt exist

    if (index !== -1) {
        items.splice(index, 1); // Removes 1 element from array
    }

}
