// Cash Box Settings Data Handler - Create/Update cash boxes
const DEBUG = window.SpendNoteDebug || false;
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
        
        if (DEBUG) console.log('Cash Box Settings initialized', isEditMode ? '(Edit mode)' : '(Create mode)');
        
        // Setup Save Changes button handler (with small delay to ensure DOM is ready)
        setTimeout(() => {
            const saveBtns = document.querySelectorAll('.btn-primary');
            if (DEBUG) console.log('Found', saveBtns.length, 'primary buttons');
            
            saveBtns.forEach(btn => {
                if (DEBUG) console.log('Button text:', btn.textContent);
                if (btn.textContent.includes('Save')) {
                    btn.addEventListener('click', handleSave);
                    if (DEBUG) console.log('Save button handler attached');
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
        
        if (DEBUG) console.log('Cash box data loaded:', cashBox.name);
        
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
        const user = await window.auth.getCurrentUser();
        
        if (!user) {
            throw new Error('You must be logged in to create a cash box');
        }
        
        // Check if profile exists (cash_boxes.user_id references profiles.id)
        let { data: profile, error: profileError } = await window.supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
        
        if (DEBUG) console.log('Profile:', profile, 'Error:', profileError);
        
        // If profile doesn't exist, create it automatically
        if (profileError || !profile) {
            if (DEBUG) console.log('Creating profile automatically...');
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
            if (DEBUG) console.log('Profile created:', profile);
        }
        
        // Prepare data
        const currencyInput = document.getElementById('currencySelect');
        const selectedColor = document.querySelector('.color-option.selected')?.dataset.color;
        const selectedIcon = document.querySelector('.icon-option.selected')?.dataset.icon;

        const currencyAliases = {
            'FT': 'HUF',
            'FORINT': 'HUF',
            'HUF': 'HUF',
            '€': 'EUR',
            'EUR': 'EUR',
            '$': 'USD',
            'USD': 'USD',
            '£': 'GBP',
            'GBP': 'GBP',
            '¥': 'JPY',
            'JPY': 'JPY'
        };

        const canonicalizeCurrency = (value) => {
            const raw = (value || '').toString().trim().toUpperCase();
            const compact = raw.replace(/\s+/g, '');

            if (currencyAliases[compact]) {
                return currencyAliases[compact];
            }

            const iso = compact.replace(/[^A-Z]/g, '');
            if (/^[A-Z]{3}$/.test(iso)) {
                return iso;
            }

            return null;
        };

        const currency = canonicalizeCurrency(currencyInput ? currencyInput.value : 'USD');
        if (!currency) {
            alert('Currency must be a valid ISO 4217 code (e.g., USD, EUR, HUF).\nTip: you can type "Ft" and it will be saved as HUF.');
            return;
        }

        try {
            new Intl.NumberFormat('en', { style: 'currency', currency }).format(0);
        } catch (err) {
            alert('Invalid currency code. Please use a valid ISO 4217 code (e.g., USD, EUR, HUF).');
            return;
        }

        if (currencyInput) {
            currencyInput.value = currency;
            currencyInput.dataset.originalCurrency = currencyInput.dataset.originalCurrency || currency;
        }

        const color = selectedColor || '#059669';
        const icon = selectedIcon || 'building';

        const updatePayload = {
            name,
            currency,
            color,
            icon
        };

        const createPayload = {
            ...updatePayload,
            current_balance: 0,
            user_id: user.id
        };
        
        if (DEBUG) console.log('Form data:', isEditMode ? updatePayload : createPayload);
        
        // Show loading state
        const saveBtn = e.target;
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        if (isEditMode) {
            // Update existing cash box
            const updateResult = await db.cashBoxes.update(currentCashBoxId, updatePayload);
            if (DEBUG) console.log('Update result:', updateResult);
            if (updateResult && updateResult.success === false) {
                throw new Error(updateResult.error || 'Failed to update cash box');
            }

            // If the edited cash box is currently selected, update saved theme
            if (localStorage.getItem('activeCashBoxId') === currentCashBoxId) {
                const rgb = (() => {
                    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
                    return m ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}` : '5, 150, 105';
                })();
                localStorage.setItem('activeCashBoxColor', color);
                localStorage.setItem('activeCashBoxRgb', rgb);
            }

            if (DEBUG) console.log('Cash box updated:', updatePayload.name);
            alert('Cash box updated successfully!');
        } else {
            // Create new cash box
            const [maxSortOrder, result] = await Promise.all([
                db.cashBoxes.getMaxSortOrder(),
                db.cashBoxes.create(createPayload)
            ]);
            const nextSortOrder = Number(maxSortOrder || 0) + 1;
            if (DEBUG) console.log('Create result:', result);
            
            if (result.success === false) {
                throw new Error(result.error || 'Failed to create cash box');
            }

            const createdId = result?.data?.id;
            if (createdId) {
                const orderResult = await db.cashBoxes.update(createdId, { sort_order: nextSortOrder });
                if (orderResult && orderResult.success === false) {
                    console.warn('⚠️ Could not set sort_order for new cash box:', orderResult.error);
                }
            }
            
            if (DEBUG) console.log('Cash box created:', createPayload.name);
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
