     class AppleDatePicker {
            constructor() {
                this.months = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];
                
                // Start with a date in the middle of the range for better visual effect
                this.selectedDay = 15;                
                this.selectedMonth = 5; // June (0-indexed)
                this.selectedYear = 2010; // Middle of the year range
                
                this.dayPicker = document.getElementById('dayPicker');
                this.monthPicker = document.getElementById('monthPicker');
                this.yearPicker = document.getElementById('yearPicker');
                this.selectedDateEl = document.getElementById('selectedDate');
                
                this.init();
            }
            
            init() {
                this.populateDays();
                this.populateMonths();
                this.populateYears();
                this.setupEventListeners();
                this.updateSelectedDate();
                this.scrollToSelected();
            }
            
            
            populateDays() {
                for (let i = 1; i <= 31; i++) {
                    const item = document.createElement('div');
                    item.className = 'picker-item';
                    item.textContent = i;
                    item.dataset.value = i;
                    this.dayPicker.appendChild(item);
                }
            }

            populateMonths() {
                this.months.forEach((month, index) => {
                    const item = document.createElement('div');
                    item.className = 'picker-item';
                    item.textContent = month;
                    item.dataset.value = index;
                    this.monthPicker.appendChild(item);
                });
            }

            populateYears() {
                const currentYear = new Date().getFullYear();
                for (let i = currentYear - 120; i <= currentYear; i++) {
                    const item = document.createElement('div');
                    item.className = 'picker-item';
                    item.textContent = i;
                    item.dataset.value = i;
                    this.yearPicker.appendChild(item);
                }
            }
            
            setupEventListeners() {
                this.dayPicker.addEventListener('scroll', () => this.handleScroll('day'));
                this.monthPicker.addEventListener('scroll', () => this.handleScroll('month'));                
                this.yearPicker.addEventListener('scroll', () => this.handleScroll('year'));
                
                // Click to select
                this.dayPicker.addEventListener('click', (e) => this.handleClick(e, 'day'));
                this.monthPicker.addEventListener('click', (e) => this.handleClick(e, 'month'));               
                this.yearPicker.addEventListener('click', (e) => this.handleClick(e, 'year'));
                
                // Custom mouse wheel handling for smooth scrolling
                this.dayPicker.addEventListener('wheel', (e) => this.handleWheel(e, 'day'));
                this.monthPicker.addEventListener('wheel', (e) => this.handleWheel(e, 'month'));
                this.yearPicker.addEventListener('wheel', (e) => this.handleWheel(e, 'year'));
            }
            
            handleWheel(e, type) {
                e.preventDefault();
                
                const picker = this[type + 'Picker'];
                const itemHeight = 40; // Height of each picker item
                const direction = e.deltaY > 0 ? 1 : -1;
                
                // Calculate current position and move by one item
                const currentScroll = picker.scrollTop;
                const targetScroll = currentScroll + (direction * itemHeight);
                
                picker.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            }
            
            handleScroll(type) {
                clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => {
                    this.updateSelection(type);
                }, 150);
                
                this.updateItemStyles(type);
            }
            
            handleClick(e, type) {
                if (e.target.classList.contains('picker-item')) {
                    const value = parseInt(e.target.dataset.value);
                    this.setSelection(type, value);
                    this.scrollToValue(type, value);
                }
            }
            
            updateSelection(type) {
                const picker = this[type + 'Picker'];
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
                    this.setSelection(type, value);
                }
            }
            
            setSelection(type, value) {
                if (type === 'month') {
                    this.selectedMonth = value;
                    this.updateDaysInMonth();
                } else if (type === 'day') {
                    this.selectedDay = Math.min(value, this.getDaysInMonth());
                } else if (type === 'year') {
                    this.selectedYear = value;
                    this.updateDaysInMonth();
                }
                
                this.updateSelectedDate();
            }
            
            updateDaysInMonth() {
                const daysInMonth = this.getDaysInMonth();
                const dayItems = this.dayPicker.querySelectorAll('.picker-item');
                
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
            
            updateItemStyles(type) {
                const picker = this[type + 'Picker'];
                const items = picker.querySelectorAll('.picker-item');
                const centerY = picker.scrollTop + picker.clientHeight / 2;
                
                items.forEach(item => {
                    const itemY = item.offsetTop + item.offsetHeight / 2;
                    const distance = Math.abs(centerY - itemY);
                    
                    if (distance < 20) {
                        // Center item - fully visible and dark
                        item.style.color = '#1d1d1f';
                        item.style.fontWeight = '600';
                    } else if (distance < 40) {
                        // First level - medium gray
                        item.style.color = '#8e8e93';
                        item.style.fontWeight = '400';
                    } else if (distance < 80) {
                        // Second level - light gray
                        item.style.color = '#c7c7cc';
                        item.style.fontWeight = '400';
                    } else {
                        // Far items - very light
                        item.style.color = '#e5e5ea';
                        item.style.fontWeight = '400';
                    }
                });
            }
            
            scrollToValue(type, value) {
                const picker = this[type + 'Picker'];
                let targetItem;
                
                if (type === 'month') {
                    targetItem = picker.querySelector(`[data-value="${value}"]`);
                } else {
                    targetItem = picker.querySelector(`[data-value="${value}"]`);
                }
                
                if (targetItem) {
                    const targetY = targetItem.offsetTop - picker.clientHeight / 2 + targetItem.offsetHeight / 2;
                    picker.scrollTo({
                        top: targetY,
                        behavior: 'smooth'
                    });
                }
            }
            
            scrollToSelected() {
                setTimeout(() => {
                    this.scrollToValue('month', this.selectedMonth);
                    this.scrollToValue('day', this.selectedDay);
                    this.scrollToValue('year', this.selectedYear);
                }, 100);
            }
            
            updateSelectedDate() {
                const date = new Date(this.selectedYear, this.selectedMonth, this.selectedDay);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                this.selectedDateEl.textContent = date.toLocaleDateString('en-US', options);
            }
        }


// Initialize the date picker when the page loads

document.addEventListener('DOMContentLoaded', () => {
    new AppleDatePicker();
});
