// ./pages/list.js
import * as Storage from "../storage.js";
import { loadHTMLTemplate } from "../templateLoader.js";
import { CustomSelect } from "/frontend/scripts/drop-down.js";
import { searchULs } from "../searchBar.js";
import * as Settings from "./settings.js";
import * as SwipeToDelete from "../swipetodelete.js";
import * as Script from '../script.js';

const debounceTimers = new Map();

// Main function
export default async function loadList() {
    Script.showNavbar();
    
    const app = document.getElementById("app");
    // LOAD app html-code
    const html = await loadHTMLTemplate("/frontend/html-pages/list.html");
    app.innerHTML = html;

    // Add event listener
    addEventListeners();

    // Load existing items from DB
    const items = await loadItemsFromDBOrWeekPlan();
    renderItems(items);

    // Add event listeners for quantity control buttons
    addQuantityControlEventListeners();

    updateCheckedItemsCount();

    activateSearchBar();

    // Initialize swipe to delete
    const list = document.querySelector(".grocery-list");
    SwipeToDelete.initializeSwipeToDelete(list, ".grocery-item", deleteItemFromUserList);
}

function addEventListeners() {
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
        const classList = "grocery-item drop-shadow addingContainer";
        if (!existingItem) {
            addItemToList(classList);
        }
    });
}

function addQuantityControlEventListeners() {
    const list = document.querySelector(".grocery-list");
    list.addEventListener("click", changeAmount);
}

async function loadItemsFromDBOrWeekPlan() {
    // Load existing items from DB
    let items = await Storage.getUserListItemsFromDB();

    // IF NO LIST ITEMS IN DB (USER LIST ITEMS) => LOAD FROM WEEK PLAN
    if (items && items.length > 0) {
        console.warn("Lade User List Items aus DB:", items);
    } else {
        // Wenn keine Items in der DB sind, WeekPlan verwenden
        console.warn("Keine User List Items gefunden – lade aus WeekPlan ...");

        items = await Storage.getIngredientsFromWeekPlan();
        console.log("Ingredients from week plan:", items);

        // Optional: gleich in DB speichern für zukünftige Zugriffe
        await Storage.setUserListItemsInDB(items);
    }

    return items;
}

function renderItems(items) {
    items.forEach((item) => addItem(item));
}

function updateCheckedItemsCount() {
    const items = document.querySelectorAll(".grocery-list li");
    const checked = getCheckedItems(items);
    const total = items.length;

    const subtextElement = document.getElementById("subtext-gl");
    if (subtextElement) {
        subtextElement.textContent = `${checked.length} out of ${total} checked`;
    } else {
        console.warn("Subtext element not found!");
    }
}

function getCheckedItems(items) {
    return Array.from(items).filter(item => item.querySelector('.checkbox-gl').checked);
}

function activateSearchBar() {
    const searchInputGro = "search-groceries";
    const groceryList = [".grocery-list"];
    searchULs(searchInputGro, groceryList);
}

function deleteItemFromUserList(identifier) {
    console.log("Deleting item with identifier:", identifier);
    Storage.deleteUserListItemFromDB(identifier);
    updateCheckedItemsCount();
}

function addItem(item) {
    const list = document.querySelector(".grocery-list");
    const li = document.createElement("li");
    li.className = "grocery-item drop-shadow";
    // li.dataset.id = item.id; // ID als data-Attribut speichern

    const identifier = returnIdentifier(item);

    const checked = item.is_checked ? "checked" : "";

    // NEUE HTML-STRUKTUR: Notwendig für die Swipe-Animation.
    // Der Inhalt wird in '.swipe-content' gepackt und ein '.swipe-delete' Button hinzugefügt.
    li.innerHTML = `
        <div class="swipe-delete">Delete</div>
        <div class="swipe-content">
            <span class="item-id">${identifier}</span>
            <input class="checkbox checkbox-gl" type="checkbox" ${checked} />
            <div class="item-details">
                <h3>${item.name}</h3>
                <span class="category subtext">${item.category}</span>
            </div>
            <div class="quantity-control">
                <button class="minus-btn"><object src="/frontend/assets/icons/minus.svg" alt="-"></object></button>
                <span class="amount">${item.amount.toFixed(0)}</span>
                <span class="unit">${pieceToPcs(item.unit_of_measurement)}</span>
                <button class="plus-btn"><object src="/frontend/assets/icons/plus.svg" alt="+"></object></button>
            </div>
        </div>
    `;

    addCheckBoxEventListener(li, identifier, item);

    if (list.firstChild) {
        list.insertBefore(li, list.firstChild);
    } else {
        list.appendChild(li);
    }
}

async function addCheckBoxEventListener(li, identifier, item) {
    // Checkbox Event Listener
    const checkbox = li.querySelector('.checkbox-gl');
    checkbox.addEventListener('change', async () => {
        const updatedItem = {
            ingredient_id: item.ingredient_id || null,
            custom_name: item.name || null,
            category: item.category || null,
            amount: item.amount,
            unit_of_measurement: item.unit_of_measurement,
            is_checked: checkbox.checked ? 1 : 0
        };

        updateCheckedItemsCount();

        await Storage.updateUserListItemInDB(identifier, updatedItem);
    });
}

function returnIdentifier(item) {
    if (item.ingredient_id !== null && item.ingredient_id !== undefined) {
        return item.ingredient_id;
    } else if (item.name) {
        return item.name;
    } else {
        console.error("Item has no valid identifier"); // Fallback
    }
}

function pieceToPcs(unit) {
    if (unit === "piece") {
        return "pcs";
    }
    return unit;
}

function pcsToPiece(unit) {
    if (unit === "pcs") {
        return "piece";
    }
    return unit;
}

function addItemToList(classList = "grocery-item drop-shadow") {
    // Save item to storage
    // Storage.addGroceryListItem(item);
    // // Add item to the list in the UI

    const list = document.querySelector(".grocery-list");

    const newItem = document.createElement("li");

    newItem.id = "newItem";
    newItem.className = classList;
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
    const categoryText = customSelects[0].querySelector(".select-text").textContent;
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
        // ingredient_id: Date.now(),
        ingredient_id: null, // No ID for new items
        name: itemName,
        category: category,
        amount: parseInt(amount, 10),
        unit_of_measurement: pcsToPiece(unit),
    };

    // Validierung Name
    const trimmedName = itemName.trim();
    const isValidName =
        trimmedName.length > 0 &&            // Nicht nur Leerzeichen
        !/^\d+$/.test(trimmedName) &&        // Nicht nur Zahlen
        !/^\d/.test(trimmedName);            // Beginnt nicht mit einer Zahl

    // Add the new item to the list + DB, but only if all fields are filled
    if (itemName && amount && category && unit && uniqueItemName(itemName)) {
        if (!isValidName) {
            alert("Please enter a valid name!\n (Name must not be empty, only numbers, or start with a number)");
            return;
        }
        addItem(newItem);
        const newItemDB = getNewItemDBFormat(newItem);
        Storage.addUserListItemToDB(newItemDB);
        // Remove the input form
        deleteNewItemForm();
    } else {
        alert("Please fill out all fields!"); // Optional: Error message
        return;
    }
    updateCheckedItemsCount();
    // // Aktualisiere die Liste
    // updateGroceryList();
    // // Zeige eine Erfolgsmeldung an
    // const successMessage = document.createElement('div');
    // successMessage.className = 'success-message';
    // successMessage.textContent = 'Item successfully added!';
    // document.body.appendChild(successMessage);
}
function uniqueItemName() {
    return true;
    // #TODO => check if already exists!!
    // ..... 
    //

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

    const identifier = itemEl.querySelector(".item-id").textContent;
    console.warn("IDENTIFIER: " + identifier);
    const updatedItem = getNewElementAfterAmountChange(itemEl, identifier);
    const debounceKey = createDebounceKey(identifier);

    debounceUpdate(debounceKey, identifier, updatedItem);
}

function getNewElementAfterAmountChange(itemEl, identifier) {
    const updatedItem = {
        ingredient_id: isNaN(identifier) ? null : identifier,
        custom_name: isNaN(identifier) ? identifier : null,
        category: itemEl.querySelector(".category").textContent,
        amount: parseInt(itemEl.querySelector(".amount").textContent, 10),
        unit_of_measurement: pcsToPiece(itemEl.querySelector(".unit").textContent),
        is_checked: itemEl.querySelector(".checkbox-gl").checked ? 1 : 0,
    };

    return updatedItem;
}

function createDebounceKey(identifier) {
    return typeof identifier === "number" ? `id_${identifier}` : `name_${identifier}`;
}

// Debounce-Logik mit 1 Sekunde Verzögerung
function debounceUpdate(debounceKey, identifier, updatedItem) {
    // Falls noch ein Timer läuft, löschen
    if (debounceTimers.has(debounceKey)) {
        clearTimeout(debounceTimers.get(debounceKey));
    }

    // Neuer Timer
    const timer = setTimeout(() => {
        Storage.updateUserListItemInDB(identifier, updatedItem); // deine bestehende Backend-Funktion
        debounceTimers.delete(debounceKey); // aufräumen
    }, 1000);

    debounceTimers.set(debounceKey, timer);
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


function isAddingNewItem() {
    return document.getElementById("newItem") !== null;
}

function filterListContent(button) {
    const filterText = button.textContent.trim();
    const isAdding = isAddingNewItem();

    document.querySelectorAll('.grocery-list li').forEach((item, index) => {
        if (index === 0 && isAdding) {
            item.style.display = ''; // always show add-item
            return;
        }

        const category = item.querySelector('.category').textContent.trim();
        item.style.display = filterText === 'All' || category.includes(filterText) ? '' : 'none';
    });
}