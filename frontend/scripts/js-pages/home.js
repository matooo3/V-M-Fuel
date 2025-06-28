// ./pages/home.js

import { loadHTMLTemplate } from '../templateLoader.js';

export default async function loadHome() {
    const app = document.getElementById('app');
    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/home.html');
    app.innerHTML = html;

    // Eventlistener: -------------------------------------------

    // DOM-Manipulation:
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove 'active' class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Add 'active' class to the clicked tab
            this.classList.add('active');
        });
    });

}



