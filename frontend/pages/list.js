// ./pages/list.js

// Initialize neccessary variables
let items = [];
let deleted_items = [];
let add_counter = 0;
let delete_counter = 0;
// let generate_counter = 0;

// Main function
export default async function loadList() {
    const app = document.getElementById('app');

    app.innerHTML = `
    <div class="list-container">
        <div class="list-header">
            <button id="restore-btn" class="list-btn">Restore all</button>
            <select id="order-btn" class="list-btn">
                <option value="food categories">Food Categories</option>
                <option value="alphabetic">Alphabetic</option>
            </select>
            <button id="grocery-btn" class="list-btn">Own gorcery list</button>
            <button id="delete-all-btn" class="list-btn">Delete all</button>
        </div>
        <ul class="checklist">
        </ul>
        <div class="add-more">Add More Items
            <div id="add-more-inputs">
                <input type="text" id="new-items" placeholder="Enter items, separated by commas">
                <button id="add-button" class="list-btn">Add</button>
            </div>
        </div>
    `;

items = await getData();
updateList(items);
    
// Add event listener 

document.getElementById("restore-btn").addEventListener("click", () => {

    restore_items();

});

document.getElementById("order-btn").addEventListener("change", () => {
 
    sort_items();
        
});


// document.getElementById("generate-btn").addEventListener("click", () => {

//     generate_counter += 1;
//     updateList(items);

// });

document.getElementById("grocery-btn").addEventListener("click", () => {

    own_grocery_list();

});

document.getElementById("delete-all-btn").addEventListener("click", () => {

    delete_counter += 1;
    delete_all();

});

document.querySelector(".add-more").addEventListener("click", () => {

    add_counter += 1;
    display_addmore(add_counter);

});

document.getElementById("new-items").addEventListener("click", (event) => {

    event.stopPropagation(); // Prevents that klicking hides the input field always

});

document.getElementById("add-button").addEventListener("click", () => {

    add_items();

});

}

// Add necessary functions
async function getData(){

    try {
        // Anfrage an das Backend
        const response = await fetch('http://172.18.45.1:3000/ingredients');
        if (!response.ok) {
            throw new Error(`Fehler: ${response.statusText}`);
        }
        const data = await response.json();

        // Nur die Namen der Ingredients extrahieren
        const names = data.map(ingredient => ingredient.name);
        console.log('Namen der Ingredients:', names); // Zum Debuggen

        return names;

    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
    }

}

function updateList(items) {

    // Get checklist
    const checklist = document.querySelector(".checklist");

    // Empty it for not adding ingredients more than once
    checklist.innerHTML = "";

    // Add items to checklist
    items.forEach(item => {

        const li = document.createElement("li");
        li.innerHTML = `
            <label class="label">
                <input class="input" type="checkbox">
                <span class="bullet"></span>
                ${item} 
                <button class="list-btn delete-button">delete</button>
            </label>
        `;
        checklist.appendChild(li);

    });

    // Add event listeners for every delete button
    const deleteButtons = document.querySelectorAll(".delete-button");

    deleteButtons.forEach(button => {
        button.addEventListener("click", (event) => {

            delete_counter += 1;
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


function display_addmore(add_counter){

    // Display input field for adding more items accordingly
    const inputsDiv = document.getElementById("add-more-inputs");

    if(add_counter % 2 == 0){

        inputsDiv.style.display = "none";

    } else {

        inputsDiv.style.display = "block";

    }

}

function add_items(){
    
    // Get user input
    const newItemsInput = document.getElementById("new-items");
    const newItems = newItemsInput.value.split(",").map(item => item.trim()).filter(item => item);

    if (newItems.length > 0) {

        for(let i = 0; i < newItems.length; i++){
            
            items.push(newItems[i]);

        }
        
        // Sort the array and then update it
        sort_items();
        updateList(items);

        newItemsInput.value = ""; // Empty input field
        document.getElementById("add-more-inputs").style.display = "none"; // Hide input field

    } else {

        alert("Please enter at least one item.");

    }
}

function delete_item(event){

    const listItem = event.target.closest("li"); // Gets the parent <li> of the button
    listItem.remove(); // Removes the <li> element from the DOM

    // Search for text label of the deleted item
    const labelText = listItem.querySelector("label").textContent.trim();
    const itemText = labelText.replace(/delete/g, '').trim();

    // Add removed item to array
    deleted_items.push(itemText);

    // Delete items finally from array
    const index = items.indexOf(itemText); // Returns -1 if the index doesnt exist
    if (index !== -1) {
        items.splice(index, 1); // Removes 1 element from array
    }


}

function restore_items(){

    console.log(delete_counter);

    if (delete_counter > 0){

     // Restore all removed items
    items.push(...deleted_items); // ... is a speed operator that spreads the array into its elements

    // Remove all items from deleted_items to prevent the user from generating them twice
    deleted_items.splice(0, deleted_items.length);

    // Sort them according to selected category and update checklist
    sort_items();
    updateList(items);  

    } else {

        alert("You have to delete at least one ingredient to be able to restore ingredients!");

    }


}

function delete_all(){

    // Add all items to deleted_items array
    deleted_items.push(...items);

    // Delete all items from the list
    items.splice(0, items.length);
    updateList(items);

}

function own_grocery_list(){

    // Delete all items from the list
    items.splice(0, items.length);
    updateList(items);

}