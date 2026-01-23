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

        // Populate currency
        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect && cashBox.currency) {
            currencySelect.value = cashBox.currency;
            currencySelect.dataset.originalCurrency = cashBox.currency;
        }

        // Populate color selection
        if (cashBox.color) {
            document.querySelectorAll('.color-option').forEach(option => {
                option.classList.toggle('selected', option.dataset.color === cashBox.color);
            });
        }

        // Populate icon selection
        if (cashBox.icon) {
            document.querySelectorAll('.icon-option').forEach(option => {
                option.classList.toggle('selected', option.dataset.icon === cashBox.icon);
            });
        }
        
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
        
        // Get current user
        console.log('🔍 Getting current user...');
        const user = await window.auth.getCurrentUser();
        console.log('👤 User:', user);
        
        if (!user) {
            throw new Error('You must be logged in to create a cash box');
        }
        
        // Check if profile exists (cash_boxes.user_id references profiles.id)
        let { data: profile, error: profileError } = await window.supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
        
        console.log('👤 Profile:', profile);
        console.log('❌ Profile error:', profileError);
        
        // If profile doesn't exist, create it automatically
        if (profileError || !profile) {
            console.log('📝 Creating profile automatically...');
            const { data: newProfile, error: createError } = await window.supabaseClient
                .from('profiles')
                .insert([{
                    id: user.id,
                    email: user.email,
                    full_name: user.email.split('@')[0],
                    subscription_tier: 'free'
                }])
                .select()
                .single();
            
            if (createError) {
                console.error('❌ Error creating profile:', createError);
                throw new Error('Failed to create profile: ' + createError.message);
            }
            
            profile = newProfile;
            console.log('✅ Profile created:', profile);
        }
        
        // Prepare data (match actual table columns)
        const currencySelect = document.getElementById('currencySelect');
        const normalizeCurrency = (value) => (value || '')
            .toString()
            .trim()
            .toUpperCase()
            .replace(/[^A-Z]/g, '')
            .slice(0, 3);

        const currency = normalizeCurrency(currencySelect ? currencySelect.value : 'USD');
        if (!currency || currency.length !== 3) {
            alert('Currency must be a 3-letter ISO code (e.g., USD, EUR, HUF).');
            return;
        }

        // Validate currency with Intl (rejects non-ISO like "FAK")
        try {
            new Intl.NumberFormat('en', { style: 'currency', currency }).format(0);
        } catch (err) {
            alert('Invalid currency code. Please use a valid ISO 4217 code (e.g., USD, EUR, HUF).');
            return;
        }

        if (currencySelect) {
            currencySelect.value = currency;
        }
        const selectedColor = document.querySelector('.color-option.selected')?.dataset.color;
        const selectedIcon = document.querySelector('.icon-option.selected')?.dataset.icon;
        const formData = {
            name: name,
            currency: currency,
            color: selectedColor || '#059669',
            icon: selectedIcon || 'building',
            current_balance: 0,
            user_id: user.id
        };
        
        console.log('📝 Form data:', formData);
        
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
            const result = await db.cashBoxes.create(formData);
            console.log('📦 Create result:', result);
            
            if (result.success === false) {
                throw new Error(result.error || 'Failed to create cash box');
            }
            
            console.log('✅ Cash box created:', formData.name);
            alert('Cash box created successfully!');
        }
        
        // Redirect back to where we came from with hard refresh
        const referrer = document.referrer;
        if (referrer && referrer.includes('dashboard.html')) {
            window.location.replace('dashboard.html');
        } else if (referrer && referrer.includes('spendnote-cash-box-list.html')) {
            window.location.replace('spendnote-cash-box-list.html');
        } else {
            // Default to cash box list if no referrer
            window.location.replace('spendnote-cash-box-list.html');
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
