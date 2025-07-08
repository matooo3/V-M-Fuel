export function searchULs(inputId, ulSelectors) {
    const input = document.getElementById(inputId);
    
    input.addEventListener('input', () => {
        const searchTerm = input.value.toLowerCase();
        
        ulSelectors.forEach(selector => {
            document.querySelectorAll(`${selector} li`).forEach(li => {
                li.style.display = li.textContent.toLowerCase().includes(searchTerm) ? '' : 'none';
            });
        });
    });
}