// ===================================
// VAT Calculator - Main Script
// ===================================

// State Management
const state = {
    mode: 'add', // 'add' or 'subtract'
    amount: 0,
    vatRate: 20, // Default Russian VAT rate
    isDarkMode: false
};

// DOM Elements
const elements = {
    modeButtons: document.querySelectorAll('.mode-btn'),
    amountInput: document.getElementById('amount'),
    customRateInput: document.getElementById('customRate'),
    rateButtons: document.querySelectorAll('.rate-btn'),
    clearBtn: document.getElementById('clearBtn'),
    copyBtn: document.getElementById('copyBtn'),
    copyText: document.getElementById('copyText'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    
    // Result elements
    originalLabel: document.getElementById('originalLabel'),
    finalLabel: document.getElementById('finalLabel'),
    originalAmount: document.getElementById('originalAmount'),
    vatAmount: document.getElementById('vatAmount'),
    finalAmount: document.getElementById('finalAmount')
};

// ===================================
// Initialization
// ===================================
function init() {
    // Load saved dark mode preference
    loadDarkMode();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial calculation
    calculate();
}

// ===================================
// Event Listeners Setup
// ===================================
function setupEventListeners() {
    // Mode toggle buttons
    elements.modeButtons.forEach(btn => {
        btn.addEventListener('click', handleModeChange);
    });
    
    // Amount input with real-time calculation
    elements.amountInput.addEventListener('input', handleAmountInput);
    elements.amountInput.addEventListener('blur', formatAmountInput);
    
    // VAT rate preset buttons
    elements.rateButtons.forEach(btn => {
        btn.addEventListener('click', handleRateButtonClick);
    });
    
    // Custom rate input
    elements.customRateInput.addEventListener('input', handleCustomRateInput);
    
    // Clear button
    elements.clearBtn.addEventListener('click', clearCalculator);
    
    // Copy button
    elements.copyBtn.addEventListener('click', copyResults);
    
    // Dark mode toggle
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Prevent form submission
    document.getElementById('vatForm').addEventListener('submit', (e) => {
        e.preventDefault();
    });
}

// ===================================
// Mode Change Handler
// ===================================
function handleModeChange(e) {
    const mode = e.currentTarget.dataset.mode;
    state.mode = mode;
    
    // Update active state
    elements.modeButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // Update labels
    updateLabels();
    
    // Recalculate
    calculate();
}

// Update result labels based on mode
function updateLabels() {
    if (state.mode === 'add') {
        elements.originalLabel.textContent = 'Сумма без НДС';
        elements.finalLabel.textContent = 'Сумма с НДС';
    } else {
        elements.originalLabel.textContent = 'Сумма с НДС';
        elements.finalLabel.textContent = 'Сумма без НДС';
    }
}

// ===================================
// Amount Input Handlers
// ===================================
function handleAmountInput(e) {
    let value = e.target.value;
    
    // Remove all non-numeric characters except decimal point
    value = value.replace(/[^\d.,]/g, '');
    
    // Replace comma with dot for decimal
    value = value.replace(',', '.');
    
    // Allow only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Update input value
    e.target.value = value;
    
    // Parse and store amount
    state.amount = parseFloat(value) || 0;
    
    // Calculate
    calculate();
}

function formatAmountInput(e) {
    if (state.amount > 0) {
        // Format with thousand separators when user leaves input
        const formatted = formatNumber(state.amount);
        e.target.value = formatted.replace('₽', '').trim();
    }
}

// ===================================
// VAT Rate Handlers
// ===================================
function handleRateButtonClick(e) {
    const rate = parseFloat(e.currentTarget.dataset.rate);
    state.vatRate = rate;
    
    // Update active state
    elements.rateButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // Clear custom rate input
    elements.customRateInput.value = '';
    
    // Recalculate
    calculate();
}

function handleCustomRateInput(e) {
    let value = parseFloat(e.target.value);
    
    // Validate range
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    
    if (!isNaN(value)) {
        state.vatRate = value;
        
        // Deactivate preset buttons
        elements.rateButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Recalculate
        calculate();
    }
}

// ===================================
// VAT Calculation Logic
// ===================================
function calculate() {
    if (state.amount <= 0) {
        // Reset to zero if no amount
        updateResults(0, 0, 0);
        return;
    }
    
    let netAmount, vatAmount, grossAmount;
    
    if (state.mode === 'add') {
        // Add VAT to net amount
        netAmount = state.amount;
        vatAmount = netAmount * (state.vatRate / 100);
        grossAmount = netAmount + vatAmount;
    } else {
        // Extract VAT from gross amount
        grossAmount = state.amount;
        netAmount = grossAmount / (1 + state.vatRate / 100);
        vatAmount = grossAmount - netAmount;
    }
    
    // Round to 2 decimal places
    netAmount = Math.round(netAmount * 100) / 100;
    vatAmount = Math.round(vatAmount * 100) / 100;
    grossAmount = Math.round(grossAmount * 100) / 100;
    
    // Update display
    if (state.mode === 'add') {
        updateResults(netAmount, vatAmount, grossAmount);
    } else {
        updateResults(grossAmount, vatAmount, netAmount);
    }
}

// Update result display with animation
function updateResults(original, vat, final) {
    animateValue(elements.originalAmount, original);
    animateValue(elements.vatAmount, vat);
    animateValue(elements.finalAmount, final);
}

// Animate number changes
function animateValue(element, targetValue) {
    const formatted = formatNumber(targetValue);
    
    // Add subtle animation class
    element.style.transform = 'scale(1.05)';
    element.style.transition = 'transform 0.2s ease';
    
    setTimeout(() => {
        element.textContent = formatted;
        element.style.transform = 'scale(1)';
    }, 100);
}

// ===================================
// Number Formatting
// ===================================
function formatNumber(num) {
    // Format with Russian locale (space as thousand separator)
    const formatted = new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
    
    return `₽${formatted}`;
}

// ===================================
// Clear Calculator
// ===================================
function clearCalculator() {
    // Reset state
    state.amount = 0;
    
    // Clear inputs
    elements.amountInput.value = '';
    elements.customRateInput.value = '';
    
    // Reset to default rate (20%)
    state.vatRate = 20;
    elements.rateButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.rate === '20') {
            btn.classList.add('active');
        }
    });
    
    // Recalculate (will show zeros)
    calculate();
    
    // Add button animation
    elements.clearBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        elements.clearBtn.style.transform = 'scale(1)';
    }, 100);
}

// ===================================
// Copy Results to Clipboard
// ===================================
async function copyResults() {
    if (state.amount <= 0) {
        showCopyFeedback('Нет данных для копирования', false);
        return;
    }
    
    // Get current results
    const originalText = elements.originalAmount.textContent;
    const vatText = elements.vatAmount.textContent;
    const finalText = elements.finalAmount.textContent;
    
    // Format text for clipboard
    const modeText = state.mode === 'add' ? 'Начисление НДС' : 'Выделение НДС';
    const clipboardText = `${modeText} (${state.vatRate}%)
    
${elements.originalLabel.textContent}: ${originalText}
Сумма НДС: ${vatText}
${elements.finalLabel.textContent}: ${finalText}`;
    
    try {
        // Copy to clipboard
        await navigator.clipboard.writeText(clipboardText);
        showCopyFeedback('Скопировано!', true);
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = clipboardText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showCopyFeedback('Скопировано!', true);
        } catch (err) {
            showCopyFeedback('Ошибка копирования', false);
        }
        
        document.body.removeChild(textArea);
    }
}

// Show copy feedback
function showCopyFeedback(message, success) {
    elements.copyText.textContent = message;
    
    if (success) {
        elements.copyBtn.classList.add('copied');
    }
    
    setTimeout(() => {
        elements.copyText.textContent = 'Копировать результат';
        elements.copyBtn.classList.remove('copied');
    }, 2000);
}

// ===================================
// Dark Mode Toggle
// ===================================
function toggleDarkMode() {
    state.isDarkMode = !state.isDarkMode;
    document.body.classList.toggle('dark-mode');
    
    // Save preference
    localStorage.setItem('darkMode', state.isDarkMode);
    
    // Add rotation animation
    elements.darkModeToggle.style.transform = 'rotate(360deg) scale(1.1)';
    setTimeout(() => {
        elements.darkModeToggle.style.transform = 'rotate(0deg) scale(1)';
    }, 300);
}

function loadDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    
    if (savedMode === 'true') {
        state.isDarkMode = true;
        document.body.classList.add('dark-mode');
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            state.isDarkMode = true;
            document.body.classList.add('dark-mode');
        }
    }
}

// ===================================
// Keyboard Shortcuts
// ===================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Clear calculator
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearCalculator();
    }
    
    // Ctrl/Cmd + C: Copy results (when not in input)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && 
        document.activeElement !== elements.amountInput &&
        document.activeElement !== elements.customRateInput) {
        e.preventDefault();
        copyResults();
    }
    
    // Ctrl/Cmd + D: Toggle dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
    }
});

// ===================================
// Initialize on page load
// ===================================
document.addEventListener('DOMContentLoaded', init);

// Optional: Add touch feedback for mobile
if ('ontouchstart' in window) {
    document.querySelectorAll('.btn, .mode-btn, .rate-btn').forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}
