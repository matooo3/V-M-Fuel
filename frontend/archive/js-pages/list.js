// ./pages/list.js
import * as Storage from '../storage.js';
import { loadHTMLTemplate } from '../templateLoader.js';

// Initialize neccessary variables
let deleted_items = [];
let add_counter = 0;
let delete_counter = 0;
let ingredients = [];
// let generate_counter = 0;

// Main function
export default async function loadList() {
    const app = document.getElementById('app');
    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/list.html');
    app.innerHTML = html;


ingredients = await getAllDishIngredients()
updateList(ingredients); 
    
// Add event listener 

document.getElementById("restore-btn").addEventListener("click", () => {

    console.log(ingredients);
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

async function getAllDishIngredients() {

    // JSON-Data
    let data = await Storage.getDataDB();
    const ingredients = data.ingredients;
    // calculate_dishes();
    const dishes = data.dishes;
    const dishIngredients = data.dishIngredients;

    // Array for ingredients and amounts
    let ingredientsArray = [];

    // Iterate over all dishes
    dishes.forEach(dish => {

        const dishId = dish.dish_id;

        // Filter ingredients for the current dish
        const relatedIngredients = dishIngredients.filter(di => di.dish_id === dishId);

        // Add ingredients and amounts to the array
        relatedIngredients.forEach(di => {

            // Find the ingredient for the current dish_ingredient element in the ingredients table
            const ingredient = ingredients.find(ing => ing.ingredient_id === di.ingredient_id);

            if (ingredient) {

                ingredientsArray.push({
                    name: ingredient.name,
                    amount: di.amount,
                    unit_of_measurement: di.unit_of_measurement
                });

            }

        });

    });

    // console.log(ingredientsArray); // For debugging
    return ingredientsArray;
}


function updateList(ingredients) {

    // Get checklist
    const checklist = document.querySelector(".checklist");

    // Empty it for not adding ingredients more than once
    checklist.innerHTML = "";

    // Add items to checklist
    ingredients.forEach(ingredient => {

        const li = document.createElement("li");
        li.innerHTML = `
            <label class="list-label">
                <input class="list-input" type="checkbox">
                <span class="list-bullet"></span>
                <span class="ingredient-name">${ingredient.name}</span>
                <input type="text" class="amount" value="${ingredient.amount}" min="0">
                <input type="text" class="unit_of_measurement" value="${ingredient.unit_of_measurement}" readonly>
                <button id = "delete-ingredients-button" class="list-btn">
                    <span id = "close" class = "material-symbols-outlined">
                        close
                    </span>
                </button>
            </label>
        `;
        checklist.appendChild(li);

    });

    // Add event listeners for every delete button
    const deleteButtons = document.querySelectorAll("#delete-ingredients-button");

    deleteButtons.forEach(button => {
        button.addEventListener("click", (event) => {

            delete_counter += 1;
            delete_item(event);

        });
    });

    const inputs = document.querySelectorAll(".amount");

    inputs.forEach(input => {
        input.addEventListener("change", (event) => {

            saveValue(event);

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
            
            ingredients.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())); // lower case variants are getting compared
            updateList(ingredients);
    
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

function add_items() {
    // Get user input
    const newItemsInput = document.getElementById("new-items");
    const newIngredientsInput = newItemsInput.value.split(",").map(item => item.trim()).filter(item => item);

    if (newIngredientsInput.length > 0) {

        for (let i = 0; i < newIngredientsInput.length; i++) {

            // Split the input by spaces
            const parts = split_input(newIngredientsInput[i]);

            console.log(parts);

            // add to ingredients
            ingredients.push(parts);
            console.log(ingredients);

        }

        // Sort the array and then update it
        sort_items();
        updateList(ingredients);

        newItemsInput.value = ""; // Empty input field
        document.getElementById("add-more-inputs").style.display = "none"; // Hide input field

    } else {

        alert("Please enter at least one item.");

    }
}

function split_input(input){

    // define regex
    const unit_amount_regex = /(\d+)\s*(ml|g|cup|slice|piece)/;

    // extracting amount and unit
    const unit_amount = input.match(unit_amount_regex);

    // extracting amount
    const amount = Number(unit_amount[1]);

    // extracting unit
    const unit_of_measurement = unit_amount[2];

    // extracting name
    const name = input.replace(unit_amount[0], "");

    return {name, amount, unit_of_measurement};

}

function delete_item(event) {

    let deletedItem = getDeletedItem(event);

    // Add the deleted item to the array of deleted items
    deleted_items.push(deletedItem);

    // Find the index of the item in the ingredients array
    const index = ingredients.findIndex(ing => 

        ing.name === deletedItem.name && 
        ing.amount === deletedItem.amount && 
        ing.unit_of_measurement === deletedItem.unit_of_measurement

    );

    console.log(index)

    // Remove the item from the ingredients array if found
    if (index !== -1) {

        ingredients.splice(index, 1); // Remove 1 element from the array

    }

}

function getDeletedItem(event) {

        // Find the parent <li> element of the delete button
        const listItem = event.target.closest("li"); 
        listItem.remove(); 
    
        // Extract the necessary values from the DOM
        const name = listItem.querySelector(".ingredient-name").textContent.trim();

        const amount = listItem.querySelector(".amount").value.trim(); 
        const unit_of_measurement = listItem.querySelector(".unit_of_measurement").value.trim(); 
    
        // Create an object containing the deleted item's details
        const deletedItem = {
            
            name: name,
            amount: Number(amount),
            unit_of_measurement: unit_of_measurement
    
        }

        return deletedItem;

}


function restore_items(){

    if (delete_counter > 0){

        // Restore all removed items  
        ingredients.push(...deleted_items) // ... is a speed operator that spreads the array into its elements

        // Remove all items from deleted_items to prevent the user from generating them twice
        deleted_items.splice(0, deleted_items.length);

        // Sort them according to selected category and update checklist
        sort_items();
        updateList(ingredients);  

    } else {

        alert("You have to delete at least one ingredient to be able to restore ingredients!");

    }


}

function delete_all(){

    // Add all items to deleted_items array
    deleted_items.push(...ingredients);

    // Delete all items from the list
    ingredients.splice(0, ingredients.length);
    updateList(ingredients);

}

function own_grocery_list(){

    // Delete all items from the list
    ingredients.splice(0, ingredients.length);
    updateList(ingredients);

}

function saveValue(event) {

    // Wert aus Inputfeld holen
    const input = event.target;
    const value = input.value.trim();

    // Prüfen, ob der Wert gültig ist
    if (isNaN(value) || value === "") {
        alert("Please enter a valid number for amount.");
        input.value = ""; // Inputfeld zurücksetzen
        return;
    }

    // DOM-Elemente holen, ohne sie zu entfernen!
    const listItem = input.closest("li");
    const name = listItem.querySelector(".ingredient-name").textContent.trim();
    const unit_of_measurement = listItem.querySelector(".unit_of_measurement").value.trim();

    // Zutatenliste aktualisieren
    ingredients.forEach(ing => {
        if (ing.name === name && ing.unit_of_measurement === unit_of_measurement) {
            ing.amount = Number(value);
        }
    });

}

