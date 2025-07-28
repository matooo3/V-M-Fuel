// ./pages/list.js
import * as Storage from "../storage.js";
import { loadHTMLTemplate } from "../templateLoader.js";
import { CustomSelect } from "/frontend/scripts/drop-down.js";
import { searchULs } from "../searchBar.js";
import * as Settings from "./settings.js";
import * as SwipeToDelete from "../swipetodelete.js";

// Main function
export default async function loadList() {
    const app = document.getElementById("app");
    // LOAD app html-code
    const html = await loadHTMLTemplate("/frontend/html-pages/list.html");
    app.innerHTML = html;

    // ingredients = await getAllDishIngredients()
    // updateList(ingredients);

    // Add event listener

    // Settings Event Listener
    Settings.loadSettingsEventListener();

    const filterButtons = document.querySelectorAll("#filter-bar button");
    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            setActiveFilterButton(button);
        });
    });

    document.getElementById("add-item-btn").addEventListener("click", () => {
        // only allow to open it once:
        const existingItem = document.getElementById("newItem");
        if (!existingItem) {
            addItemToList();
        }
    });







    // IF NO LIST ITEMS IN DB (USER LIST ITEMS) => LOAD FROM WEEK PLAN

    // Load existing items from DB
    const userListItems = await Storage.getUserListItemsFromDB();

    if (userListItems && userListItems.length > 0) {
        console.log("Lade User List Items aus DB:", userListItems);
        userListItems.forEach((item) => addItem(item));
    } else {
        // Wenn keine Items in der DB sind, WeekPlan verwenden
        console.warn("Keine User List Items gefunden – lade aus WeekPlan ...");

        const ingredients = await Storage.getIngredientsFromWeekPlan();
        console.warn("Ingredients from week plan:", ingredients);

        ingredients.forEach((item) => addItem(item));

        // Optional: gleich in DB speichern für zukünftige Zugriffe
        await Storage.setUserListItemsInDB(ingredients);
    }









    // Add event listeners for quantity control buttons
    const list = document.querySelector(".grocery-list");

    list.addEventListener("click", changeAmount);

    const searchInputGro = "search-groceries";
    const groceryList = [".grocery-list"];
    searchULs(searchInputGro, groceryList);

    // Initialize swipe to delete
    SwipeToDelete.initializeSwipeToDelete(list, ".grocery-item", deleteItemFromUserList);
}

function deleteItemFromUserList(ingredient_id) {
    console.warn("Deleting item with ingredient_id:", ingredient_id);
    Storage.deleteUserListItemFromDB(ingredient_id);
}

function addItem(item) {
    const list = document.querySelector(".grocery-list");
    const li = document.createElement("li");
    li.className = "grocery-item drop-shadow";
    li.dataset.id = item.id; // ID als data-Attribut speichern

    // NEUE HTML-STRUKTUR: Notwendig für die Swipe-Animation.
    // Der Inhalt wird in '.swipe-content' gepackt und ein '.swipe-delete' Button hinzugefügt.
    li.innerHTML = `
        <div class="swipe-delete">Delete</div>
        <div class="swipe-content">
            <span class="item-id">${item.ingredient_id}</span>
            <input class="checkbox checkbox-gl" type="checkbox" />
            <div class="item-details">
                <h3>${item.name}</h3>
                <span class="category subtext">${item.category}</span>
            </div>
            <div class="quantity-control">
                <button class="minus-btn"><img src="/frontend/assets/icons/minus.svg" alt="-"></button>
                <span class="amount">${item.amount.toFixed(0)}</span>
                <span class="unit">${pieceToPcs(item.unit_of_measurement)}</span>
                <button class="plus-btn"><img src="/frontend/assets/icons/plus.svg" alt="+"></button>
            </div>
        </div>
    `;

    if (list.firstChild) {
        list.insertBefore(li, list.firstChild);
    } else {
        list.appendChild(li);
    }
}

function pieceToPcs(unit) {
    if (unit === "piece") {
        return "pcs";
    }
    return unit;
}

function addItemToList() {
    // Save item to storage
    // Storage.addGroceryListItem(item);
    // // Add item to the list in the UI

    const list = document.querySelector(".grocery-list");

    const newItem = document.createElement("li");

    newItem.id = "newItem";
    newItem.className = "grocery-item drop-shadow";
    // Hier soll input felder kommen wo user das item eingeben kann
    newItem.innerHTML = `
    <div id="new-item-container">
        <div class="item-details-add">
            <input id="name-gl" type="text" placeholder="Item Name" />
            <div class="custom-select">
                <div class="select-trigger">
                    <span class="select-text">Protein</span>
                    <div class="select-arrow"></div>
                </div>
                <div class="select-dropdown">
                    <div class="select-option" data-value="Protein">Protein</div>
                    <div class="select-option" data-value="Fruit">Fruit</div>
                    <div class="select-option" data-value="Dairy">Dairy</div>
                </div>
            </div>
        </div>
        <div class="quantity-control-add">
            <input id="number-gl" type="number" placeholder="100" />
            <div class="custom-select">
                <div class="select-trigger">
                    <span class="select-text">Select Unit</span>
                    <div class="select-arrow"></div>
                </div>
                <div class="select-dropdown">
                    <div class="select-option" data-value="g">g</div>
                    <div class="select-option" data-value="pcs">pcs</div>
                    <div class="select-option" data-value="ml">ml</div>
                </div>
            </div>
        </div>
    </div>
    <div class="buttons-container">
        <button class="cancel-btn">Cancel</button>
        <button class="save-btn">Save</button>
    </div>
    `;

    // Als erstes Kind einfügen:
    list.insertBefore(newItem, list.firstChild);

    // Initialize custom select
    const customSelects = newItem.querySelectorAll(".custom-select");
    customSelects.forEach((selectElement) => {
        new CustomSelect(selectElement);
    });

    // Füge Event Listener für die Buttons hinzu
    const saveBtn = newItem.querySelector(".save-btn");
    const cancelBtn = newItem.querySelector(".cancel-btn");
    saveBtn.addEventListener("click", saveNewItem);
    cancelBtn.addEventListener("click", deleteNewItemForm);
}

function saveNewItem() {
    const newItemContainer = document.getElementById("new-item-container");
    const itemName = newItemContainer.querySelector('input[type="text"]').value;
    const amount = newItemContainer.querySelector('input[type="number"]').value;

    // Get values from the custom selects by reading the displayed text
    const customSelects = newItemContainer.querySelectorAll(".custom-select");
    const categoryText =
        customSelects[0].querySelector(".select-text").textContent;
    const unitText = customSelects[1].querySelector(".select-text").textContent;

    // Check if actual values were selected (not the default placeholder text)
    const category =
        categoryText !== "Select Category" && categoryText !== "Protein"
            ? categoryText
            : categoryText;
    const unit =
        unitText !== "Select Unit" && unitText !== "g" ? unitText : unitText;

    // Create new item object
    const newItem = {
        ingredient_id: Date.now(),
        name: itemName,
        category: category,
        amount: parseInt(amount, 10),
        unit_of_measurement: unit,
    };

    // Save the new item to storage (uncomment when ready)
    // Storage.addGroceryListItem(newItem);

    // Add the new item to the list, but only if all fields are filled
    if (itemName && amount && category && unit) {
        addItem(newItem);
        const newItemDB = getNewItemDBFormat(newItem);
        Storage.addUserListItemToDB(newItemDB);
        // Remove the input form
        deleteNewItemForm();
    } else {
        alert("Please fill out all fields!"); // Optional: Error message
        return;
    }

    // // Aktualisiere die Liste
    // updateGroceryList();
    // // Zeige eine Erfolgsmeldung an
    // const successMessage = document.createElement('div');
    // successMessage.className = 'success-message';
    // successMessage.textContent = 'Item successfully added!';
    // document.body.appendChild(successMessage);
}

function getNewItemDBFormat(item) {
    return {
        // ingredient_id: item.ingredient_id,
        custom_name: item.name,
        category: item.category,
        amount: item.amount,
        unit_of_measurement: item.unit_of_measurement,
    };
}

function deleteNewItemForm() {
    const newItem = document.getElementById("newItem");
    if (newItem) {
        newItem.remove();
    }
}

function changeAmount(event) {
    // NEU: Verhindert, dass beim Klick auf "Delete" die Menge geändert wird.
    if (event.target.closest(".swipe-delete")) return;

    const btn = event.target.closest("button");
    // NEU: Genauerer Check, ob der Button wirklich im quantity-control ist.
    if (!btn || !btn.closest(".quantity-control")) return;
    event.preventDefault();

    // NEU: Selektor auf '.swipe-content' geändert, da dies der neue Container ist.
    const itemEl = btn.closest(".swipe-content");
    const amountSpan = itemEl.querySelector(".amount");
    if (!amountSpan) return;
    let amount = parseInt(amountSpan.textContent, 10);

    if (btn.classList.contains("plus-btn")) {
        amountSpan.textContent = amount + 1;
    } else if (btn.classList.contains("minus-btn") && amount > 1) {
        amountSpan.textContent = amount - 1;
    }
}

// -----------------------------------------------------------
// active class for BUTTONS in filter-bar
// -----------------------------------------------------------

function setActiveFilterButton(button) {
    const buttons = document.querySelectorAll("#filter-bar button");
    buttons.forEach((btn) => {
        if (btn === button) {
            filterListContent(button);

            btn.classList.add("active");
            btn.classList.remove("notActive");
        } else {
            btn.classList.remove("active");
            btn.classList.add("notActive");
        }
    });
}

function filterListContent(button) {
    const filterText = button.textContent.trim();

    document.querySelectorAll(".grocery-list li").forEach((item) => {
        const category = item.querySelector(".category").textContent.trim();
        item.style.display =
            filterText === "All" || category.includes(filterText) ? "" : "none";
    });
}