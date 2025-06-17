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
                    pickers: ['whole', 'decimal'],
                    displayId: 'selectedHeight',
                    hasUnit: true,
                    units: ['cm', 'inch'],
                    ranges: {
                        cm: { min: 100, max: 250 },
                        inch: { min: 39, max: 98 }
                    },
                    conversion: 2.54 // cm to inch conversion
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
        // Unit toggle for height/weight
        if (this.config.hasUnit && this.unitToggle) {
            this.unitToggle.addEventListener('click', (e) => {
                if (e.target.classList.contains('unit-button')) {
                    this.switchUnit(e.target.dataset.unit);
                }
            });
        }
        
        // Picker interactions
        this.config.pickers.forEach(pickerType => {
            const picker = this.pickers[pickerType];
            
            // Scroll handling
            picker.addEventListener('scroll', () => this.handleScroll(pickerType));
            
            // Click handling
            picker.addEventListener('click', (e) => this.handleClick(e, pickerType));
            
            // Wheel handling
            picker.addEventListener('wheel', (e) => this.handleWheel(e, pickerType));
        });
    }
    
    switchUnit(newUnit) {
        if (newUnit === this.currentUnit || this.type === 'age') return;
        
        // Convert current value
        const currentValue = this.selectedWhole + (this.selectedDecimal / 10);
        let convertedValue;
        
        if (this.type === 'height') {
            if (newUnit === 'inch') {
                convertedValue = currentValue / this.config.conversion;
                this.unitToggle.classList.add('inch');
            } else {
                convertedValue = currentValue * this.config.conversion;
                this.unitToggle.classList.remove('inch');
            }
        } else if (this.type === 'weight') {
            if (newUnit === 'pounds') {
                convertedValue = currentValue * this.config.conversion;
                this.unitToggle.classList.add('pounds');
            } else {
                convertedValue = currentValue / this.config.conversion;
                this.unitToggle.classList.remove('pounds');
            }
        }
        
        this.currentUnit = newUnit;
        this.selectedWhole = Math.floor(convertedValue);
        this.selectedDecimal = Math.round((convertedValue % 1) * 10);
        
        // Update active button
        document.querySelectorAll('.unit-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.unit === newUnit);
        });
        
        // Repopulate and scroll
        this.populatePicker('whole');
        this.updateDisplay();
        this.scrollToSelected();
    }
    
    handleWheel(e, pickerType) {
        e.preventDefault();
        
        const picker = this.pickers[pickerType];
        const itemHeight = 40;
        const direction = e.deltaY > 0 ? 1 : -1;
        
        const currentScroll = picker.scrollTop;
        const targetScroll = currentScroll + (direction * itemHeight);
        
        picker.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
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
            picker.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
        }
    }
    
    scrollToSelected() {
        setTimeout(() => {
            this.config.pickers.forEach(pickerType => {
                let value;
                switch (this.type) {
                    case 'age':
                        value = pickerType === 'day' ? this.selectedDay : 
                               pickerType === 'month' ? this.selectedMonth : this.selectedYear;
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
                const height = this.selectedWhole + (this.selectedDecimal / 10);
                this.displayEl.textContent = `${height.toFixed(1)} ${this.currentUnit}`;
                break;
                
            case 'weight':
                const weight = this.selectedWhole + (this.selectedDecimal / 10);
                this.displayEl.textContent = `${weight.toFixed(1)} ${this.currentUnit}`;
                break;
        }
    }
    
    // Getter methods
    getSelectedValue() {
        switch (this.type) {
            case 'age':
                return this.getSelectedDate();
            case 'height':
                return this.getSelectedHeight();
            case 'weight':
                return this.getSelectedWeight();
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
    
    getSelectedHeight() {
        const height = this.selectedWhole + (this.selectedDecimal / 10);
        return {
            whole: this.selectedWhole,
            decimal: this.selectedDecimal,
            unit: this.currentUnit,
            value: height,
            formatted: this.displayEl.textContent,
            cm: this.currentUnit === 'cm' ? height : height * this.config.conversion,
            inches: this.currentUnit === 'inch' ? height : height / this.config.conversion,
            displayString: `${height.toFixed(1)} ${this.currentUnit}`,
            feet: this.currentUnit === 'inch' ? 
                `${Math.floor(height / 12)}'${Math.round(height % 12)}"` : 
                `${Math.floor((height / this.config.conversion) / 12)}'${Math.round((height / this.config.conversion) % 12)}"`
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

// -----------------------------------
// For Matze:

// Global instances
let pickerInstance;

// Global getter functions
function getSelectedValue() {
    return pickerInstance?.getSelectedValue() || null;
}

// -----------------------------------

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