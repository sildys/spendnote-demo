// SpendNote - Main JavaScript

// Navigation menu functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle (if needed in future)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Load and apply saved active cash box color
    const savedColor = localStorage.getItem('activeCashBoxColor');
    const savedRgb = localStorage.getItem('activeCashBoxRgb');
    
    if (savedColor && savedRgb) {
        // Apply saved colors to CSS variables
        document.documentElement.style.setProperty('--active', savedColor);
        document.documentElement.style.setProperty('--active-rgb', savedRgb);
        
        // Update menu item colors
        const navCashItems = document.querySelectorAll('.nav-cash-item');
        navCashItems.forEach(item => {
            item.style.color = savedColor;
        });
        
        const otherNavItems = document.querySelectorAll('.nav-links a:not(.nav-cash-item):not(.btn)');
        otherNavItems.forEach(item => {
            item.style.color = savedColor;
        });
        
        // Update New Transaction button background color
        const newTransactionBtn = document.querySelector('.nav-new-transaction-btn');
        if (newTransactionBtn) {
            newTransactionBtn.style.background = `linear-gradient(135deg, ${savedColor}, ${savedColor})`;
        }
    }
});

// Utility functions
const SpendNote = {
    // Format currency
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },
    
    // Format date
    formatDate: function(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    },
    
    // Show notification
    showNotification: function(message, type = 'info') {
        // Simple alert for now, can be enhanced later
        alert(message);
    }
};

// Export for use in other scripts
window.SpendNote = SpendNote;
