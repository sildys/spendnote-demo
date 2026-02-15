// ===== COMPACT LOGO EDITOR =====
// Simple +/- zoom controls for logo size on receipts

const LogoEditor = (() => {
    const LOGO_KEY = 'spendnote.proLogoDataUrl';
    const LEGACY_LOGO_KEY = 'spendnote.receipt.logo.v1';
    const LOGO_SCALE_KEY = 'spendnote.receipt.logoScale.v1';

    const MIN_SCALE = 0.5;
    const MAX_SCALE = 3.0;
    const STEP = 0.1;

    let preview = null;
    let image = null;
    let info = null;
    let currentScale = 1.0;

    const clampScale = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return 1;
        return Math.round(Math.min(MAX_SCALE, Math.max(MIN_SCALE, n)) * 100) / 100;
    };

    const readLogo = () => {
        try {
            return localStorage.getItem(LOGO_KEY) || localStorage.getItem(LEGACY_LOGO_KEY);
        } catch {
            return null;
        }
    };

    const writeLogo = (dataUrl) => {
        try {
            if (dataUrl) {
                localStorage.setItem(LOGO_KEY, dataUrl);
                localStorage.setItem(LEGACY_LOGO_KEY, dataUrl);
            } else {
                localStorage.removeItem(LOGO_KEY);
                localStorage.removeItem(LEGACY_LOGO_KEY);
            }
        } catch {}
    };

    const readScale = () => {
        try {
            return parseFloat(localStorage.getItem(LOGO_SCALE_KEY) || '1');
        } catch {
            return 1;
        }
    };

    const writeScale = (value) => {
        try {
            localStorage.setItem(LOGO_SCALE_KEY, String(clampScale(value)));
        } catch {}
    };

    const updateInfo = () => {
        if (info) {
            info.textContent = `${Math.round(currentScale * 100)}%`;
        }
    };

    const setScale = (value) => {
        currentScale = clampScale(value);
        writeScale(currentScale);
        updateInfo();
    };

    const loadLogo = () => {
        const stored = readLogo();
        if (stored && image && preview) {
            if (!image.src || image.src !== stored) {
                image.src = stored;
            }
            preview.classList.add('has-logo');
            currentScale = clampScale(readScale());
            updateInfo();

            if (image.complete && image.naturalWidth === 0) {
                preview.classList.remove('has-logo');
            }
            image.onerror = () => {
                preview.classList.remove('has-logo');
            };
        } else if (preview) {
            preview.classList.remove('has-logo');
            if (image) image.removeAttribute('src');
        }
    };

    const removeLogo = () => {
        writeLogo(null);
        if (preview) preview.classList.remove('has-logo');
        if (image) image.removeAttribute('src');
        currentScale = 1.0;
        writeScale(currentScale);
        updateInfo();
    };

    const uploadLogo = (file) => {
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            if (window.showAlert) {
                window.showAlert('Max logo size is 2MB.', { iconType: 'warning' });
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            if (!dataUrl?.startsWith('data:image/')) {
                if (window.showAlert) {
                    window.showAlert('Invalid image.', { iconType: 'error' });
                }
                return;
            }
            writeLogo(dataUrl);
            currentScale = 1.0;
            writeScale(currentScale);
            loadLogo();
        };
        reader.readAsDataURL(file);
    };

    const init = () => {
        preview = document.getElementById('logoEditorCanvas');
        image = document.getElementById('logoEditorImage');
        info = document.getElementById('logoEditorInfo');

        if (!preview || !image) return;

        // Zoom +/- buttons
        const zoomIn = document.getElementById('logoZoomIn');
        const zoomOut = document.getElementById('logoZoomOut');

        if (zoomIn) {
            zoomIn.addEventListener('click', () => setScale(currentScale + STEP));
        }
        if (zoomOut) {
            zoomOut.addEventListener('click', () => setScale(currentScale - STEP));
        }

        // Upload/Remove — clone to avoid duplicate listeners
        const uploadBtn = document.getElementById('logoUploadBtn');
        const removeBtn = document.getElementById('logoRemoveBtn');
        const fileInput = document.getElementById('logoFileInput');

        if (uploadBtn && fileInput) {
            const newUploadBtn = uploadBtn.cloneNode(true);
            uploadBtn.parentNode.replaceChild(newUploadBtn, uploadBtn);
            newUploadBtn.addEventListener('click', () => fileInput.click());
        }

        if (removeBtn) {
            const newRemoveBtn = removeBtn.cloneNode(true);
            removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);
            newRemoveBtn.addEventListener('click', removeLogo);
        }

        if (fileInput) {
            const newFileInput = fileInput.cloneNode(true);
            fileInput.parentNode.replaceChild(newFileInput, fileInput);
            newFileInput.addEventListener('change', (e) => {
                const file = e.target?.files?.[0];
                if (file) uploadLogo(file);
            });
        }

        // Load initial logo
        loadLogo();
    };

    return { init, loadLogo, removeLogo, uploadLogo };
})();

// Export for manual initialization
window.LogoEditor = LogoEditor;
