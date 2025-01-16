// ./pages/list.js

// Initialize neccessary variables
let items = getData();
let deleted_items = [];
let add_counter = 0;
let generate_counter = 0;

// Main function
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
            <button id="restore-btn" class="meal-btn">Restore one item</button>
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
document.getElementById("order-btn").addEventListener("change", () => {
 
    sort_items();
        
});


document.getElementById("generate-btn").addEventListener("click", () => {

    generate_counter += 1;
    updateList(items);

});

document.getElementById("restore-btn").addEventListener("click", () => {

    restore_items();

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
function getData(){

    // Get Data from database - TODO
    return ["Gurke", "Apfel", "Banane"];

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
                <button class="meal-btn delete-button">delete</button>
            </label>
        `;
        checklist.appendChild(li);

    });

    // Add event listeners for every delete button
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

    // If checklist is empty then do nothing - TODO
    const checklist = document.querySelector(".checklist")

    if (generate_counter > 0){

     // Restore all removed items
     for(let i = 0; i < deleted_items.length; i++){
        
        items.push(deleted_items[i]);

    }

    // Remove all items from deleted_items to prevent the user from generating them twice
    deleted_items.splice(0, deleted_items.length);

    console.log(items);
    // Sort them according to selected category and update checklist
    sort_items();
    updateList(items);  

    } else {

        alert("You cant restore items before generating them!");

    }


}