// Cash Box Settings Data Handler - Create/Update cash boxes
let isEditMode = false;
let currentCashBoxId = null;

// Initialize page
async function initCashBoxSettings() {
    try {
        // Check if we're in edit mode (URL has id parameter)
        const urlParams = new URLSearchParams(window.location.search);
        currentCashBoxId = urlParams.get('id');
        
        if (currentCashBoxId) {
            // Edit mode - load existing cash box
            isEditMode = true;
            await loadCashBoxData(currentCashBoxId);
            
            // Update page title
            const pageTitle = document.querySelector('.page-title-group h1');
            if (pageTitle) pageTitle.textContent = 'Edit Cash Box';
        } else {
            // Create mode
            isEditMode = false;
            
            // Update page title
            const pageTitle = document.querySelector('.page-title-group h1');
            if (pageTitle) pageTitle.textContent = 'Create Cash Box';
        }
        
        console.log('✅ Cash Box Settings initialized', isEditMode ? '(Edit mode)' : '(Create mode)');
        
        // Setup Save Changes button handler (with small delay to ensure DOM is ready)
        setTimeout(() => {
            const saveBtns = document.querySelectorAll('.btn-primary');
            console.log('🔍 Found', saveBtns.length, 'primary buttons');
            
            saveBtns.forEach(btn => {
                console.log('🔍 Button text:', btn.textContent);
                if (btn.textContent.includes('Save')) {
                    btn.addEventListener('click', handleSave);
                    console.log('✅ Save button handler attached');
                }
            });
        }, 100);
        
    } catch (error) {
        console.error('❌ Error initializing cash box settings:', error);
    }
}

// Load existing cash box data
async function loadCashBoxData(id) {
    try {
        const cashBox = await db.cashBoxes.getById(id);
        
        if (!cashBox) {
            alert('Cash box not found');
            window.location.href = 'spendnote-cash-box-list.html';
            return;
        }
        
        // Populate the name field
        const nameInput = document.getElementById('cashBoxNameInput');
        if (nameInput) nameInput.value = cashBox.name || '';
        
        console.log('✅ Cash box data loaded:', cashBox.name);
        
    } catch (error) {
        console.error('❌ Error loading cash box data:', error);
        alert('Error loading cash box data');
    }
}

// Handle save button click
async function handleSave(e) {
    e.preventDefault();
    
    try {
        // Get the name from the input
        const nameInput = document.getElementById('cashBoxNameInput');
        const name = nameInput ? nameInput.value.trim() : '';
        
        // Validate
        if (!name) {
            alert('Please enter a cash box name');
            return;
        }
        
        // Prepare data
        const formData = {
            name: name,
            description: '',
            initial_balance: 0,
            current_balance: 0,
            currency: 'USD',
            color: '#059669',
            icon: 'building'
        };
        
        // Show loading state
        const saveBtn = e.target;
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        if (isEditMode) {
            // Update existing cash box
            await db.cashBoxes.update(currentCashBoxId, formData);
            console.log('✅ Cash box updated:', formData.name);
            alert('Cash box updated successfully!');
        } else {
            // Create new cash box
            const newCashBox = await db.cashBoxes.create(formData);
            console.log('✅ Cash box created:', formData.name);
            alert('Cash box created successfully!');
        }
        
        // Redirect back to where we came from
        const referrer = document.referrer;
        if (referrer && referrer.includes('dashboard.html')) {
            window.location.href = 'dashboard.html';
        } else if (referrer && referrer.includes('spendnote-cash-box-list.html')) {
            window.location.href = 'spendnote-cash-box-list.html';
        } else {
            // Default to cash box list if no referrer
            window.location.href = 'spendnote-cash-box-list.html';
        }
        
    } catch (error) {
        console.error('❌ Error saving cash box:', error);
        alert('Error saving cash box: ' + error.message);
        
        // Restore button state
        const saveBtn = e.target;
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCashBoxSettings);
} else {
    initCashBoxSettings();
}
