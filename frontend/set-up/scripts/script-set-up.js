
// ==============================
// =======SCROLL ELEMENTS========
// ==============================


// ===== CLASS DEFINITION =====

class UniversalApplePicker {
    constructor(type, options = {}) {
        this.type = type; // 'age', 'height', 'weight'
        this.options = options;
        
        // Initialize based on type
        this.initializeByType();
        
        // Common elements
        this.displayEl = document.getElementById(this.config.displayId);
        
        // Type-specific elements
        if (this.config.hasUnit) {
            this.unitToggle = document.getElementById('unitToggle');
        }
        
        this.pickers = {};
        this.config.pickers.forEach(picker => {
            this.pickers[picker] = document.getElementById(picker + 'Picker');
        });
        
        this.init();
    }
    
    initializeByType() {
        switch (this.type) {
            case 'age':
                this.config = {
                    pickers: ['day', 'month', 'year'],
                    displayId: 'selectedDate',
                    hasUnit: false,
                    months: [
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                    ]
                };
                this.selectedDay = 15;
                this.selectedMonth = 5; // June (0-indexed)
                this.selectedYear = 2010;
                break;
                
            case 'height':
                this.config = {
                    pickers: ['whole', 'decimal'], // 'whole' will be feet, 'decimal' will be inches
                    displayId: 'selectedHeight',
                    hasUnit: true,
                    // units are now 'cm' and 'ft'
                    units: ['cm', 'ft'],
                    ranges: {
                        cm: { min: 100, max: 250 },
                        // ADDED: range for feet and inches
                        ft: { 
                            whole: { min: 3, max: 8 }, // Range for feet
                            decimal: { min: 0, max: 11 } // Range for inches
                        }
                    },
                    conversion: 2.54 // cm to inch conversion remains useful
                };
                this.currentUnit = 'cm';
                this.selectedWhole = 175;
                this.selectedDecimal = 0;
                break;
                
            case 'weight':
                this.config = {
                    pickers: ['whole', 'decimal'],
                    displayId: 'selectedWeight',
                    hasUnit: true,
                    units: ['kg', 'pounds'],
                    ranges: {
                        kg: { min: 30, max: 200 },
                        pounds: { min: 66, max: 440 }
                    },
                    conversion: 2.20462 // kg to pounds conversion
                };
                this.currentUnit = 'kg';
                this.selectedWhole = 75;
                this.selectedDecimal = 5;
                break;
        }
    }
    
    init() {
        this.populatePickers();
        this.setupEventListeners();
        this.updateDisplay();
        this.scrollToSelected();
    }
    
    populatePickers() {
        this.config.pickers.forEach(pickerType => {
            this.populatePicker(pickerType);
        });
    }
    
    populatePicker(pickerType) {
        const picker = this.pickers[pickerType];
        picker.innerHTML = '';
        
        let items = [];
        
        switch (this.type) {
            case 'age':
                if (pickerType === 'day') {
                    items = Array.from({length: 31}, (_, i) => ({value: i + 1, text: i + 1}));
                } else if (pickerType === 'month') {
                    items = this.config.months.map((month, index) => ({value: index, text: month}));
                } else if (pickerType === 'year') {
                    const currentYear = new Date().getFullYear();
                    items = Array.from({length: 121}, (_, i) => {
                        const year = currentYear - 120 + i;
                        return {value: year, text: year};
                    });
                }
                break;
                
            case 'height':
                // Logic now handles both 'cm' and 'ft' units differently
                if (this.currentUnit === 'cm') {
                    if (pickerType === 'whole') {
                        const range = this.config.ranges.cm;
                        items = Array.from({length: range.max - range.min + 1}, (_, i) => {
                            const value = range.min + i;
                            return {value: value, text: value};
                        });
                    } else if (pickerType === 'decimal') {
                        items = Array.from({length: 10}, (_, i) => ({value: i, text: i}));
                    }
                } else { // currentUnit is 'ft'
                    if (pickerType === 'whole') { // 'whole' picker now for FEET
                        const range = this.config.ranges.ft.whole;
                        items = Array.from({length: range.max - range.min + 1}, (_, i) => {
                            const value = range.min + i;
                            return {value: value, text: `${value}'`};
                        });
                    } else if (pickerType === 'decimal') { // 'decimal' picker now for INCHES
                        const range = this.config.ranges.ft.decimal;
                        items = Array.from({length: range.max - range.min + 1}, (_, i) => {
                            const value = range.min + i;
                            return {value: value, text: `${value}"`};
                        });
                    }
                }
                break;
            
            case 'weight':
                if (pickerType === 'whole') {
                    const range = this.config.ranges[this.currentUnit];
                    items = Array.from({length: range.max - range.min + 1}, (_, i) => {
                        const value = range.min + i;
                        return {value: value, text: value};
                    });
                } else if (pickerType === 'decimal') {
                    items = Array.from({length: 10}, (_, i) => ({value: i, text: i}));
                }
                break;
        }
        
        items.forEach(item => {
            const element = document.createElement('div');
            element.className = 'picker-item';
            element.textContent = item.text;
            element.dataset.value = item.value;
            picker.appendChild(element);
        });
    }
    
    setupEventListeners() {
        if (this.config.hasUnit && this.unitToggle) {
            this.unitToggle.addEventListener('click', (e) => {
                if (e.target.classList.contains('unit-button') && e.target.dataset.unit) {
                    this.switchUnit(e.target.dataset.unit);
                }
            });
        }
        
        this.config.pickers.forEach(pickerType => {
            const picker = this.pickers[pickerType];
            picker.addEventListener('scroll', () => this.handleScroll(pickerType));
            picker.addEventListener('click', (e) => this.handleClick(e, pickerType));
            picker.addEventListener('wheel', (e) => this.handleWheel(e, pickerType));
        });
    }
    
    switchUnit(newUnit) {
        if (newUnit === this.currentUnit || this.type === 'age') return;
        
        // CHANGED: Height conversion logic is completely new
        if (this.type === 'height') {
            if (newUnit === 'ft') { // From cm to ft
                const totalCm = this.selectedWhole + (this.selectedDecimal / 10);
                const totalInches = totalCm / this.config.conversion;
                this.selectedWhole = Math.floor(totalInches / 12); // Feet
                this.selectedDecimal = Math.round(totalInches % 12); // Inches
                if (this.selectedDecimal === 12) { // Handle rounding up to 12 inches
                    this.selectedWhole += 1;
                    this.selectedDecimal = 0;
                }
                this.unitToggle.classList.add('ft');
            } else { // From ft to cm
                const totalInches = (this.selectedWhole * 12) + this.selectedDecimal;
                const totalCm = totalInches * this.config.conversion;
                this.selectedWhole = Math.floor(totalCm);
                this.selectedDecimal = Math.round((totalCm % 1) * 10);
                 if (this.selectedDecimal === 10) { // Handle rounding up to 10 decimals
                    this.selectedWhole += 1;
                    this.selectedDecimal = 0;
                }
                this.unitToggle.classList.remove('ft');
            }
        } else if (this.type === 'weight') {
            const currentValue = this.selectedWhole + (this.selectedDecimal / 10);
            let convertedValue;
            if (newUnit === 'pounds') {
                convertedValue = currentValue * this.config.conversion;
                this.unitToggle.classList.add('pounds');
            } else {
                convertedValue = currentValue / this.config.conversion;
                this.unitToggle.classList.remove('pounds');
            }
            this.selectedWhole = Math.floor(convertedValue);
            this.selectedDecimal = Math.round((convertedValue % 1) * 10);
        }
        
        this.currentUnit = newUnit;
        
        document.querySelectorAll('.unit-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.unit === newUnit);
        });
        
        // Repopulate pickers (both for height, as ranges change for both)
        if(this.type === 'height') {
            this.populatePicker('whole');
            this.populatePicker('decimal');
        } else {
            this.populatePicker('whole');
        }

        this.updateDisplay();
        this.scrollToSelected();
    }
    
    handleWheel(e, pickerType) {
        e.preventDefault();
        const picker = this.pickers[pickerType];
        const itemHeight = 40;
        const direction = e.deltaY > 0 ? 1 : -1;
        const targetScroll = picker.scrollTop + (direction * itemHeight);
        picker.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
    
    handleScroll(pickerType) {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.updateSelection(pickerType);
        }, 150);
        this.updateItemStyles(pickerType);
    }
    
    handleClick(e, pickerType) {
        if (e.target.classList.contains('picker-item')) {
            const value = parseInt(e.target.dataset.value);
            this.setSelection(pickerType, value);
            this.scrollToValue(pickerType, value);
        }
    }
    
    updateSelection(pickerType) {
        const picker = this.pickers[pickerType];
        const items = picker.querySelectorAll('.picker-item');
        const centerY = picker.scrollTop + picker.clientHeight / 2;
        let closestItem = null;
        let closestDistance = Infinity;
        
        items.forEach(item => {
            const itemY = item.offsetTop + item.offsetHeight / 2;
            const distance = Math.abs(centerY - itemY);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
        });
        
        if (closestItem) {
            const value = parseInt(closestItem.dataset.value);
            this.setSelection(pickerType, value);
        }
    }
    
    setSelection(pickerType, value) {
        switch (this.type) {
            case 'age':
                if (pickerType === 'month') {
                    this.selectedMonth = value;
                    this.updateDaysInMonth();
                } else if (pickerType === 'day') {
                    this.selectedDay = Math.min(value, this.getDaysInMonth());
                } else if (pickerType === 'year') {
                    this.selectedYear = value;
                    this.updateDaysInMonth();
                }
                break;
            case 'height':
            case 'weight':
                if (pickerType === 'whole') {
                    this.selectedWhole = value;
                } else if (pickerType === 'decimal') {
                    this.selectedDecimal = value;
                }
                break;
        }
        this.updateDisplay();
    }
    
    updateDaysInMonth() {
        if (this.type !== 'age') return;
        const daysInMonth = this.getDaysInMonth();
        const dayItems = this.pickers.day.querySelectorAll('.picker-item');
        dayItems.forEach((item, index) => {
            const day = index + 1;
            item.style.opacity = day <= daysInMonth ? '1' : '0.3';
            item.style.pointerEvents = day <= daysInMonth ? 'auto' : 'none';
        });
        if (this.selectedDay > daysInMonth) {
            this.selectedDay = daysInMonth;
            this.scrollToValue('day', this.selectedDay);
        }
    }
    
    getDaysInMonth() {
        return new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    }
    
    updateItemStyles(pickerType) {
        const picker = this.pickers[pickerType];
        const items = picker.querySelectorAll('.picker-item');
        const centerY = picker.scrollTop + picker.clientHeight / 2;
        items.forEach(item => {
            const itemY = item.offsetTop + item.offsetHeight / 2;
            const distance = Math.abs(centerY - itemY);
            if (distance < 20) {
                item.style.color = '#1d1d1f';
                item.style.fontWeight = '600';
            } else if (distance < 40) {
                item.style.color = '#8e8e93';
                item.style.fontWeight = '400';
            } else if (distance < 80) {
                item.style.color = '#c7c7cc';
                item.style.fontWeight = '400';
            } else {
                item.style.color = '#e5e5ea';
                item.style.fontWeight = '400';
            }
        });
    }
    
    scrollToValue(pickerType, value) {
        const picker = this.pickers[pickerType];
        const targetItem = picker.querySelector(`[data-value="${value}"]`);
        if (targetItem) {
            const targetY = targetItem.offsetTop - picker.clientHeight / 2 + targetItem.offsetHeight / 2;
            picker.scrollTo({ top: targetY, behavior: 'smooth' });
        }
    }
    
    scrollToSelected() {
        setTimeout(() => {
            this.config.pickers.forEach(pickerType => {
                let value;
                switch (this.type) {
                    case 'age':
                        value = pickerType === 'day' ? this.selectedDay : pickerType === 'month' ? this.selectedMonth : this.selectedYear;
                        break;
                    case 'height':
                    case 'weight':
                        value = pickerType === 'whole' ? this.selectedWhole : this.selectedDecimal;
                        break;
                }
                this.scrollToValue(pickerType, value);
            });
        }, 100);
    }
    
    updateDisplay() {
        switch (this.type) {
            case 'age':
                const date = new Date(this.selectedYear, this.selectedMonth, this.selectedDay);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                this.displayEl.textContent = date.toLocaleDateString('en-US', options);
                break;
            case 'height':
                // CHANGED: Display logic now handles 'ft' format
                if (this.currentUnit === 'cm') {
                    const height = this.selectedWhole + (this.selectedDecimal / 10);
                    this.displayEl.textContent = `${height.toFixed(1)} ${this.currentUnit}`;
                } else { // 'ft'
                    this.displayEl.textContent = `${this.selectedWhole}' ${this.selectedDecimal}"`;
                }
                break;
            case 'weight':
                const weight = this.selectedWhole + (this.selectedDecimal / 10);
                this.displayEl.textContent = `${weight.toFixed(1)} ${this.currentUnit}`;
                break;
        }
    }
    
    getSelectedDate() {
        const date = new Date(this.selectedYear, this.selectedMonth, this.selectedDay);
        return {
            day: this.selectedDay,
            month: this.selectedMonth,
            year: this.selectedYear,
            monthName: this.config.months[this.selectedMonth],
            dateObject: date,
            formattedDate: this.displayEl.textContent,
            isoString: date.toISOString().split('T')[0],
            age: this.calculateAge()
        };
    }
    
    // REWRITTEN: This method now correctly calculates and returns all height values.
    getSelectedHeight() {
        let totalCm, totalInches;

        if (this.currentUnit === 'cm') {
            totalCm = this.selectedWhole + (this.selectedDecimal / 10);
            totalInches = totalCm / this.config.conversion;
        } else { // 'ft'
            totalInches = (this.selectedWhole * 12) + this.selectedDecimal;
            totalCm = totalInches * this.config.conversion;
        }
        
        const feet = Math.floor(totalInches / 12);
        const inchesComponent = Math.round(totalInches % 12);

        return {
            unit: this.currentUnit,
            formatted: this.displayEl.textContent,
            cm: parseFloat(totalCm.toFixed(1)),
            total_inches: parseFloat(totalInches.toFixed(2)),
            feet: feet,
            inches: inchesComponent, // The inch part of the ft/in value
            feet_and_inches_string: `${feet}' ${inchesComponent}"`
        };
    }
    
    getSelectedWeight() {
        const weight = this.selectedWhole + (this.selectedDecimal / 10);
        return {
            whole: this.selectedWhole,
            decimal: this.selectedDecimal,
            unit: this.currentUnit,
            value: weight,
            formatted: this.displayEl.textContent,
            kg: this.currentUnit === 'kg' ? weight : weight / this.config.conversion,
            pounds: this.currentUnit === 'pounds' ? weight : weight * this.config.conversion,
            displayString: `${weight.toFixed(1)} ${this.currentUnit}`,
            stones: this.currentUnit === 'pounds' ? 
                `${Math.floor(weight / 14)} st ${Math.round(weight % 14)} lbs` : 
                `${Math.floor((weight * this.config.conversion) / 14)} st ${Math.round((weight * this.config.conversion) % 14)} lbs`
        };
    }
    
    calculateAge() {
        const today = new Date();
        const birthDate = new Date(this.selectedYear, this.selectedMonth, this.selectedDay);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
}

// ===== AUTO-INITIALIZATION =====

let pickerInstance;

// Auto-initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    const currentFile = window.location.pathname.split('/').pop();
    
    if (currentFile === 'age.html') {

        pickerInstance = new UniversalApplePicker('age');

    } else if (currentFile === 'height.html') {
        
        pickerInstance = new UniversalApplePicker('height');

    } else if (currentFile === 'weight.html') {

        pickerInstance = new UniversalApplePicker('weight');

    }
});

// Run when page loads
document.addEventListener('DOMContentLoaded', initNavigation);

// ==============================
// ======= CARD ELEMENTS ========
// ==============================

// Event listener for card selection
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    card.addEventListener('click', function() {
        // Remove selected class from all cards
        cards.forEach(c => c.classList.remove('clicked'));
        
        // Add selected class to clicked card
        this.classList.add('clicked');
    });
});


// ==============================
// ======= NAVIGATION ===========
// ==============================


// ======= SET VARIABLES ========

// connect pages in the onboarding flow
const pages = [
  'getstarted.html', 
  ['gender.html', 'log-in.html'], // Branch: gender or login
  'age.html', 
  'weight.html', 
  'height.html', 
  'activity-level.html',
  'goal.html', 
  'account.html',
];

let cardDataArray = [];


// ======= GET AND SET PREVIOUS AND NEXT PAGES ========

// Store the previous page when navigating to login
function storePreviousPage() {
    const currentFile = window.location.pathname.split('/').pop();
    sessionStorage.setItem('previousPage', currentFile);
}

// Get the stored previous page
function getPreviousPage() {
    return sessionStorage.getItem('previousPage');
}

// Clear stored previous page
function clearPreviousPage() {
    sessionStorage.removeItem('previousePage');
}

// Get current page from URL
function getCurrentPageIndex() {
    const currentFile = window.location.pathname.split('/').pop();
    
    // Check if current file is in the pages array
    for (let i = 0; i < pages.length; i++) {
        if (Array.isArray(pages[i])) {
            // Check if current file is in the branch array
            if (pages[i].includes(currentFile)) {
                return i;
            }
        } else if (pages[i] === currentFile) {
            return i;
        }
    }
    
    return 0; // Default to first page if not found
}

// Get the next page based on current page and user choice
function getNextPage(currentIndex) {
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= pages.length) {
        return '../../index.html'; // End of flow
    }
    
    const nextPage = pages[nextIndex];
    
    // If next page is an array, return the first option (default path)
    if (Array.isArray(nextPage)) {
        return `../pages/${nextPage[0]}`;
    }
    
    return `../pages/${nextPage}`;
}

// Get the previous page for normal navigation
function getPreviousPageNormal(currentIndex) {
    const prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
        return null; // No previous page
    }
    
    const prevPage = pages[prevIndex];
    
    // If previous page is an array, we need to determine which one to go back to
    // For now, go to the first option
    if (Array.isArray(prevPage)) {
        return `../pages/${prevPage[0]}`;
    }
    
    return `../pages/${prevPage}`;
}


// ======= NAVIGATION FUNCTIONALITY ========

// Initialize navigation
function initNavigation() {
    const currentIndex = getCurrentPageIndex();
    const currentFile = window.location.pathname.split('/').pop();
    const nextBtn = document.querySelector('.next-btn');
    const backArrow = document.querySelector('.arrow-back');
    const loginBtn = document.querySelector('.login-btn');


    // ======= FROM GENDER TO LOG-IN ========
    if(currentFile !== 'getstarted.html') {
        // Event listener for log in in the footer section
        const text_log_in = document.querySelector('.log-in');
        
        if (text_log_in) {
            text_log_in.addEventListener('click', function() {
                // Store current page before navigating to login
                storePreviousPage();
                window.location.href = '../pages/log-in.html';
            });
        }
    }


    // ======= FROM LOG-IN TO RESET PASSWORD ========
    if(currentFile === 'log-in.html') {
        const reset = document.querySelector('.reset');
        
        if (reset) {
            reset.addEventListener('click', function() {
                // 1. Only replace the personal-data-div content
                const personalDataDiv = document.getElementById('personal-data-div');
                if (personalDataDiv) {
                    personalDataDiv.innerHTML = `
                        <form>
                            <input class = "data" type="email" placeholder="Enter your email address" id="reset-email">
                        <form>
                    `;
                }

                // Transform the email div to just a horizontal line
                const emailText = document.getElementById('email-text');
                if (emailText) {
                    emailText.textContent = 'Or reset password';
                }

                // Event listener for the next button
                const nextBtn = document.querySelector('.next-btn');
                if (nextBtn) {

                    // Clone the button to remove all event listeners
                    const newBtn = nextBtn.cloneNode(true);
                    nextBtn.parentNode.replaceChild(newBtn, nextBtn);
                    
                    // Now configure the new button
                    newBtn.textContent = 'Send Reset Link';
                    newBtn.className = 'reset-btn';
                    
                    // Add the reset functionality for new button
                    newBtn.addEventListener('click', function() {
                        const emailInput = document.getElementById('reset-email');
                        const email = emailInput.value.trim();
                        
                        if (email && email.includes('@')) {

                            // Show success message in personal-data-div
                            personalDataDiv.innerHTML = `
                                <div class="personal-data-div">
                                    <div class = "sign-up" > 
                                    <img src="../pictures/email logo.png" alt="email-logo" id="email-logo"/>
                                    <h1 id = "sign-up-text">Email sent!</h1>
                                    </div>
                                </div>
                            `;
                            
                            // Change button to "Back to Login"
                            newBtn.textContent = 'Back to Login';
                            newBtn.className = 'reset-btn';
                            
                            // Remove old event listener and add new one
                            const finalBtn = newBtn.cloneNode(true);
                            newBtn.parentNode.replaceChild(finalBtn, newBtn);
                            
                            // Add back to login functionality to the new button
                            finalBtn.addEventListener('click', function() {
                                window.location.reload();
                            });
                                                        // Update footer text
                            const footerText = document.getElementById('footer-text');
                            if (footerText) {
                                
                                footerText.innerHTML = 'Please check your email!'; // Hide footer text

                            }

                            
                        } else {
                            // Show error message
                            emailInput.style.borderColor = 'red';
                            emailInput.style.backgroundColor = '#ffe6e6';
                            emailInput.placeholder = 'Please enter a valid email address';
                            emailInput.value = '';
                        }
                    });
                }

                const backArrow = document.querySelector('.arrow-back');
                if (backArrow) {
                    // Hide the back arrow on reset page
                    backArrow.style.display = 'none';
                }
                
                // Update the footer text
                const footerText = document.getElementById('footer-text');
                if (footerText) {
                    footerText.innerHTML = 'Remember your password? <span class="accent-col login-link">Back to Login</span>';
                }
                
                // Add functionality to "Back to Login" link in footer
                const loginLink = document.querySelector('.login-link');
                if (loginLink) {
                    loginLink.addEventListener('click', function() {
                        // Reload the page to restore original login form
                        window.location.reload();
                    });
                }
            });
        }
    }

    // Handle login button (specific to getstarted.html)
    if (loginBtn && currentFile === 'getstarted.html') {
        loginBtn.addEventListener('click', function() {
            // Store getstarted as previous page
            storePreviousPage();
            window.location.href = '../pages/log-in.html';
        });
    }

    function getCardInfo(){

        const selectedCard = document.querySelector('.card.clicked');
        let cardDataArray = [];
        
        if (selectedCard) {

            if(localStorage.getItem('cardDataArray')) {

                // If cardDataArray already exists in localStorage, retrieve it
                cardDataArray = JSON.parse(localStorage.getItem('cardDataArray'));
                cardDataArray.push(selectedCard.textContent.trim()); // Add new card data
                localStorage.setItem('cardDataArray', JSON.stringify(cardDataArray));

            } else {

                // Get the data attributes from the selected card
                cardDataArray = [selectedCard.textContent.trim()];
                localStorage.setItem('cardDataArray', JSON.stringify(cardDataArray));

            }

        }
        
        return null; // No card selected
    }
    
    // Configure next button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {

            let ageData = [];
            let weightData = [];
            let heightData = [];

            if (currentFile === 'age.html'){
                ageData = pickerInstance.getSelectedDate();

                // Store in localStorage
                localStorage.setItem('ageData', JSON.stringify(ageData.formattedDate));
            }

            if (currentFile === 'weight.html') {
                weightData = pickerInstance.getSelectedWeight();

                // Store in localStorage
                localStorage.setItem('weightData', JSON.stringify(weightData.formatted));
            }

            if (currentFile === 'height.html'){
                heightData = pickerInstance.getSelectedHeight();

                // Store in localStorage
                localStorage.setItem('heightData', JSON.stringify(heightData.formatted));
            }

            const pagesWithCards = ['goal.html', 'activity-level.html', 'gender.html'];

            if (pagesWithCards.includes(currentFile)) {
                
                getCardInfo(); // Get selected card info
                
            }

            if (currentIndex === pages.length - 1) {
                // Last page - go to main index
                clearPreviousPage(); // Clear stored page when completing flow
                window.location.href = '../../index.html'; //password needs to be set up

            } else {
                // Special handling for getstarted.html - default to gender.html
                if (currentFile === 'getstarted.html') {
                    clearPreviousPage(); // Clear any stored previous page
                    window.location.href = '../pages/gender.html';

                } else if (currentFile === 'log-in.html') {
                    // Validate login credentials before proceeding
                    const emailInput = document.querySelector('input[type="email"]');
                    const passwordInput = document.querySelector('input[type="password"]');
                    
                    const email = emailInput.value.trim();
                    const password = passwordInput.value.trim();
                    
                    // Reset previous error styles
                    emailInput.style.borderColor = '';
                    passwordInput.style.borderColor = '';
                    emailInput.style.backgroundColor = '';
                    passwordInput.style.backgroundColor = '';
                    
                    let isValid = true;
                    
                    // Email validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!email) {
                        emailInput.style.borderColor = 'red';
                        emailInput.style.backgroundColor = '#ffe6e6';
                        emailInput.placeholder = 'Email is required';
                        isValid = false;
                    } else if (!emailRegex.test(email)) {
                        emailInput.style.borderColor = 'red';
                        emailInput.style.backgroundColor = '#ffe6e6';
                        emailInput.value = '';
                        emailInput.placeholder = 'Please enter a valid email address';
                        isValid = false;
                    }
                    
                    // Password validation
                    if (!password) {
                        passwordInput.style.borderColor = 'red';
                        passwordInput.style.backgroundColor = '#ffe6e6';
                        passwordInput.placeholder = 'Password is required';
                        isValid = false;
                    } else if (password.length < 6) {
                        passwordInput.style.borderColor = 'red';
                        passwordInput.style.backgroundColor = '#ffe6e6';
                        passwordInput.value = '';
                        passwordInput.placeholder = 'Password must be at least 6 characters';
                        isValid = false;
                    }
                    
                    // If validation passes, proceed to next page
                    if (isValid) {
                        // Here you would typically validate against a database
                        // For demo purposes, we'll accept any valid email/password combo
                        // You can add specific email/password combinations for testing:
                        
                        // Example: Check for demo credentials
                        if (email === 'demo@example.com' && password === 'password123') {
                            clearPreviousPage(); // Clear stored page after login
                            window.location.href = '../../index.html';
                        } else {
                            // For demo, accept any valid format for now
                            // In production, this would make an API call to verify credentials
                            clearPreviousPage(); // Clear stored page after login
                            window.location.href = '../../index.html';
                        }
                    }

                } else {
                    // Normal flow
                    const nextPage = getNextPage(currentIndex);
                    window.location.href = nextPage;
                }
            }
        });
    }
    
    // Configure back arrow
    if (backArrow) {
        if (currentIndex > 0 || currentFile === 'log-in.html') {
            backArrow.style.display = 'block';
            backArrow.style.cursor = 'pointer';
            
            backArrow.addEventListener('click', function() {
                
                if (currentFile === 'log-in.html') {
                    // Go back to the page that led to login
                    const previousPage = getPreviousPage();
                    
                    if (previousPage && previousPage !== 'log-in.html') {
                        clearPreviousPage(); // Clear after using
                        window.location.href = `../pages/${previousPage}`;
                    } else {
                        // Fallback to getstarted if no previous page stored
                        window.location.href = '../pages/getstarted.html';
                    }
                    
                } else if (currentFile === 'age.html') {
                    // Age can come from gender or log-in, default back to gender
                    window.location.href = '../pages/gender.html';
                    
                } else {
                    // Normal flow
                    const prevPage = getPreviousPageNormal(currentIndex);
                    if (prevPage) {
                        window.location.href = prevPage;
                    }
                }
            });
        } 
    }
}