// ./pages/list.js
import * as Storage from "../storage.js";
import { loadHTMLTemplate } from "../templateLoader.js";
import { CustomSelect } from "../drop-down.js";
import { searchULs } from "../searchBar.js";
import * as Settings from "./settings.js";
import * as SwipeToDelete from "../swipetodelete.js";
import * as Script from '../script.js';
import * as DropDown from '../drop-down.js';

const debounceTimers = new Map();

// Main function
export default async function loadList() {
    Script.showNavbar();

    const app = document.getElementById("app");
    // LOAD app html-code
    const html = await loadHTMLTemplate("../../html-pages/list.html");
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

    const checkedCount = document.getElementById("checked-count-gl");
    const totalCount = document.getElementById("total-count-gl");
    if (checkedCount && totalCount) {
        checkedCount.textContent = `${checked.length}`;
        totalCount.textContent = `${total}`;
    } else {
        console.warn("Checked count or total count element not found!");
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

    li.innerHTML = loadItemHTML(item);

    addCheckBoxEventListener(li, item);
    addEditItemEventListener(li, item);

    if (item.is_checked) {
        hideQuantityControl(li);
    }

    if (list.firstChild) {
        list.insertBefore(li, list.firstChild);
    } else {
        list.appendChild(li);
    }
}
function loadItemHTML(item) {
    const identifier = returnIdentifier(item);
    const checked = item.is_checked ? "checked" : "";

    return `
        <div class="swipe-delete">Delete</div>
        <div class="swipe-content">
            <span class="item-id">${identifier}</span>
            <input class="checkbox checkbox-gl" type="checkbox" ${checked} />
            <div class="item-details">
                <h3>${item.name}</h3>
                <span class="category subtext">${item.category}</span>
            </div>
            <div class="quantity-control">
                <button class="minus-btn"><object src="../../assets/icons/minus.svg" alt="-"></object></button>
                <span class="amount">${Math.round(item.amount)}</span>
                <span class="unit">${pieceToPcs(item.unit_of_measurement)}</span>
                <button class="plus-btn"><object src="../../assets/icons/plus.svg" alt="+"></object></button>
            </div>
        </div>
    `;
}

// -----------------------------------------------------------
// Edit Item
// -----------------------------------------------------------
function addEditItemEventListener(li, item) {
    if (item.is_checked) return; // no EL for checked items

    li.querySelector('.item-details').addEventListener("click", () => {
        editItem(li, item);
    });
}
function deleteEditItemEventListener(li, item) {
    const itemDetails = li.querySelector('.item-details');
    if (itemDetails) {
        const clone = itemDetails.cloneNode(true); // Deep clone ohne Event Listener
        itemDetails.parentNode.replaceChild(clone, itemDetails);
    }
}


function editItem(li, item) {
    // 0. only open one at once
    if (!isAddingNewItem()) {
        // 1. save old item for later
        const oldLi = li.cloneNode(true);

        // 2. remove old item => open edit form
        const formHTML = loadAddNewItemHTML(item);
        markAsID(li);
        li.innerHTML = formHTML;

        // 3. initialize Custom Selects
        initializeCustomSelects();

        // 4. fill form with old item data
        loadOldDataIntoForm(li, item);


        // 5. set event listeners for save / cancel buttons:
        const saveBtn = li.querySelector(".save-btn");
        const cancelBtn = li.querySelector(".cancel-btn");
        saveBtn.addEventListener("click", () => {
            saveEditedItem(li, oldLi, item);
        });
        cancelBtn.addEventListener("click", () => {
            // cancelEditItem(li, item);
            li.replaceWith(oldLi); // Restore old item
            // adde alle alten Event Listener wieder hinzu
            addCheckBoxEventListener(oldLi, item);
            addEditItemEventListener(oldLi, item);
            updateCheckedItemsCount();
        });
    }
}

function markAsID(li) {
    li.id = "newItem";
    const classList = "grocery-item drop-shadow addingContainer";
    li.className = classList;
}

function loadOldDataIntoForm(li, item) {
    const container = li.querySelector("#new-item-container");
    container.querySelector('input[type="text"]').value = item.name || "";
    container.querySelector('input[type="number"]').value = Math.round(item.amount) || "";
    const selects = container.querySelectorAll(".custom-select");
    selects[0].querySelector(".select-text").textContent = item.category || "Protein";
    selects[1].querySelector(".select-text").textContent = pieceToPcs(item.unit_of_measurement) || "g";
}

function saveEditedItem(li, oldLi, item) {
    // 6. read data from form
    const result = prepareItemFromForm();

    // 7. validate data
    if (!validateItemResult(result)) return;

    // 8. build new data
    const updatedItem = {
        ...result.item,
        is_checked: 0 // oder aus altem Zustand übernehmen
    };
    Storage.updateUserListItemInDB(returnIdentifier(item), updatedItem);
    updateItem(li, oldLi, updatedItem);
}

function updateItem(li, oldLi, updatedItem) {
    // 9. load updated li-item
    unmarkAsID(li, oldLi);
    li.innerHTML = loadItemHTML(updatedItem);

    // X. create new DOM element
    // const newLi = document.createElement("li");
    // unmarkAsID(newLi, oldLi); // add the li-element id/classes again!
    // newLi.className = "grocery-item drop-shadow";
    // newLi.innerHTML = loadItemHTML(updatedItem);

    // 10. add event listeners again
    addEditItemEventListener(li, updatedItem);
    addCheckBoxEventListener(li, updatedItem);
    addQuantityControlEventListeners();
    SwipeToDelete.initializeSwipeToDelete(li, ".grocery-item", deleteItemFromUserList);

    // XX. replace old li with newLi
    // li.replaceWith(newLi);
}

function unmarkAsID(li, oldLi) {
    // li gets id and class from old item
    li.id = oldLi.id || "";
    li.className = oldLi.className || "grocery-item drop-shadow";
}


// -----------------------------------------------------------
// Checkbox Event Handling
// -----------------------------------------------------------
function lockCheckbox(li, checkbox, event, duration) {
    if (li.dataset.locked === "true") {
        event.preventDefault();
        checkbox.checked = true;
        return true;
    }

    li.dataset.locked = "true";
    setTimeout(() => {
        delete li.dataset.locked;
    }, duration);

    return false;
}
function unlockCheckbox(li) {
    delete li.dataset.locked;
}
async function addCheckBoxEventListener(li, item) {
    const checkbox = li.querySelector('.checkbox-gl');
    checkbox.addEventListener('change', (e) => clickCheckbox(e, li, item, checkbox));
}

async function clickCheckbox(e, li, item, checkbox) {
    const timeDelay = 600;

    if (lockCheckbox(li, checkbox, e, timeDelay)) return; // LOCK

    const updatedItem = {
        ingredient_id: item.ingredient_id || null,
        custom_name: item.name || null,
        category: item.category || null,
        amount: item.amount,
        unit_of_measurement: item.unit_of_measurement,
        is_checked: checkbox.checked ? 1 : 0
    };

    updateCheckedItemsCount();
    await moveCheckedItemToBottom(li, updatedItem.is_checked, timeDelay, item);
    await Storage.updateUserListItemInDB(returnIdentifier(item), updatedItem);

    unlockCheckbox(li); // UNLOCK
}


async function moveCheckedItemToBottom(li, isChecked, timeDelay, item) {
    const list = document.querySelector(".grocery-list");
    if (isChecked) {
        deleteEditItemEventListener(li, item); // lock editing
        hideQuantityControl(li);
        await new Promise(resolve => setTimeout(resolve, timeDelay));
        list.appendChild(li);
    } else {
        addEditItemEventListener(li, item); // enable editing
        showQuantityControl(li);
        list.insertBefore(li, list.firstChild);
    }
}

function hideQuantityControl(li) {
    const quantityControl = li.querySelector(".quantity-control");
    if (quantityControl) {
        quantityControl.style.display = "none";
    }
}
function showQuantityControl(li) {
    const quantityControl = li.querySelector(".quantity-control");
    if (quantityControl) {
        quantityControl.style.display = "flex";
    }
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

// -----------------------------------------------------------
// Add new item to the list
// -----------------------------------------------------------
// helper function
function initializeCustomSelects() {
    // Initialize custom select
    const customSelects = newItem.querySelectorAll(".custom-select");
    customSelects.forEach((selectElement) => {
        new CustomSelect(selectElement);
    });
    // DropDown.addDropdownEventlisteners();
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
    newItem.innerHTML = loadAddNewItemHTML();

    // Als erstes Kind einfügen:
    list.insertBefore(newItem, list.firstChild);

    // initialize Custom Selects
    initializeCustomSelects();

    // Füge Event Listener für die Buttons hinzu
    const saveBtn = newItem.querySelector(".save-btn");
    const cancelBtn = newItem.querySelector(".cancel-btn");
    saveBtn.addEventListener("click", saveNewItem);
    cancelBtn.addEventListener("click", deleteNewItemForm);
}
function loadAddNewItemHTML() {
    return `
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
}

function saveNewItem() {
    const newItem = prepareItemFromForm();

    // Add the new item to the list + DB, but only if all fields are filled
    if (!validateItemResult(newItem)) return;

    addItem(newItem.item);
    const newItemDB = getNewItemDBFormat(newItem.item);
    Storage.addUserListItemToDB(newItemDB);
    // Remove the input form
    deleteNewItemForm();

    updateCheckedItemsCount();
    // Zeige eine Erfolgsmeldung an // #TODO (popup oder so)
}

function validateItemResult(newItem) {
    if (!newItem.allFieldsFilled) {
        alert("Please fill out all fields!");
        return false;
    }

    if (!newItem.isValidName) {
        alert("Please enter a valid name!\n(Name must not be empty, only numbers, or start with a number)");
        return false;
    }

    if (!newItem.isUniqueName) {
        alert("An item with this name already exists.");
        return false;
    }

    return true;
}

function prepareItemFromForm() {
    const container = document.getElementById("new-item-container");
    const name = container.querySelector('input[type="text"]').value.trim();
    const amount = parseInt(container.querySelector('input[type="number"]').value, 10);

    const selects = container.querySelectorAll(".custom-select");
    const categoryText = selects[0].querySelector(".select-text").textContent;
    const unitText = selects[1].querySelector(".select-text").textContent;

    const category = categoryText;
    const unit = pcsToPiece(unitText);

    const isValidName =
        name.length > 0 &&
        !/^\d+$/.test(name) &&
        !/^\d/.test(name);

    const allFieldsFilled = !!(name && amount && category && unit);
    const isUniqueName = uniqueItemName(name); // wichtig!

    return {
        allFieldsFilled,
        isValidName,
        isUniqueName,
        name,
        amount,
        category,
        unit,
        item: {
            ingredient_id: null, // Only for new items
            name,
            custom_name: name, // for DB
            category,
            amount,
            unit_of_measurement: unit,
            is_checked: 0 // default not checked
        }
    };
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


// -----------------------------------------------------------
// Change Amount of Item
// -----------------------------------------------------------
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