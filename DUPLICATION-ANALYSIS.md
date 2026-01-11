# Code Duplication Analysis

## Findings

### CSS Variables Duplication
**Found in 17 HTML files:**
- index.html
- spendnote-cash-box-list.html
- spendnote-cash-box-detail.html
- spendnote-cash-box-settings.html
- spendnote-transaction-history.html
- spendnote-transaction-detail.html
- spendnote-partner-list.html
- spendnote-user-settings.html
- spendnote-login.html
- spendnote-signup.html
- spendnote-forgot-password.html
- spendnote-faq.html
- spendnote-pricing.html
- spendnote-privacy.html
- spendnote-terms.html
- spendnote-receipt-detail.html
- 404.html

**Duplicated Code:**
```css
:root {
    --primary: #059669;
    --primary-light: #10b981;
    --primary-dark: #047857;
    --orange: #f59e0b;
    --blue: #3b82f6;
    --bg: #fafafa;
    --surface: #ffffff;
    --surface-elevated: #f5f5f5;
    --text: #0a0a0a;
    --text-muted: #737373;
    --border: rgba(0,0,0,0.08);
    --shadow: rgba(0,0,0,0.04);
    --error: #ef4444;
    --success: #059669;
    --active: #059669;
    --active-rgb: 5, 150, 105;
}
```

**Solution:** Move to `assets/css/main.css` ✓ (Already done)

### Navigation HTML Duplication
**Found in all main pages**
- Same navigation structure repeated
- Same logo SVG repeated
- Same menu items repeated

**Solution:** Extract to shared component or use JavaScript to inject

### Footer HTML Duplication
**Found in all main pages**
- Same footer structure repeated

**Solution:** Extract to shared component

### Common CSS Classes
- Button styles
- Form styles
- Card styles
- Modal styles
- Table styles

**Solution:** Move all to `assets/css/main.css`

## Action Plan
1. Update all HTML files to link to `assets/css/main.css`
2. Remove duplicate CSS from each file
3. Keep only page-specific CSS in `<style>` tags
4. Extract navigation to component
5. Extract footer to component
