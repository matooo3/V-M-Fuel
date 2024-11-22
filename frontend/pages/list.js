// ./pages/list.js
export default function loadList() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>List</h1>
        <p>Willkommen auf der List-Seite!</p>
    `;
<<<<<<< Updated upstream
}
=======

// Add event listener
document.getElementById('update-button').addEventListener('click', () => {

    // function for getting the right food from data base still needs to be implemented!!
    const array = ["Apfel", "Banane", "Tomate"]
    // TODO

    updateList(array)
});
}

    // fuction for updating list
    function updateList(array) {
    
        const checklist = document.querySelector('.checklist');
    
        // remove all entries
        checklist.innerHTML = '';
    
        // add new entries
        array.forEach((item) => {
            // create list elements for each food item in array
            const li = document.createElement('li');
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            const bullet = document.createElement('span');
            bullet.className = 'bullet';
            const text = document.createTextNode(` ${item}`);
    
            // merge elements
            label.appendChild(checkbox);
            label.appendChild(bullet);
            label.appendChild(text);
            li.appendChild(label);
            checklist.appendChild(li);
        });
    }
>>>>>>> Stashed changes
