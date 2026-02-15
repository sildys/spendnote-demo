// ===== COMPACT LOGO EDITOR =====
// Simple +/- zoom controls for logo size on receipts

const LogoEditor = (() => {
    const LOGO_KEY = 'spendnote.proLogoDataUrl';
    const LEGACY_LOGO_KEY = 'spendnote.receipt.logo.v1';
    const LOGO_SCALE_KEY = 'spendnote.receipt.logoScale.v1';
    const LOGO_POSITION_KEY = 'spendnote.receipt.logoPosition.v1';

    const MIN_SCALE = 0.5;
    const MAX_SCALE = 3.0;
    const STEP = 0.1;

    let preview = null;
    let image = null;
    let info = null;
    let currentScale = 1.0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let imgStartX = 0;
    let imgStartY = 0;
    let snapshotTimer = null;
    let hasUserEdited = false;

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
        // Persist to DB
        try {
            if (window.db?.profiles?.update) {
                window.db.profiles.update({ account_logo_url: dataUrl || null }).catch(() => {});
            }
        } catch (_) {}
    };

    const scheduleSnapshot = () => {
        try {
            if (snapshotTimer) clearTimeout(snapshotTimer);
            snapshotTimer = setTimeout(() => {
                renderSnapshot();
            }, 160);
        } catch (_) {}
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
        persistLogoSettings();
        scheduleSnapshot();
    };

    const persistLogoSettings = () => {
        try {
            if (window.db?.profiles?.update) {
                window.db.profiles.update({
                    logo_settings: { scale: currentScale, x: currentX, y: currentY }
                }).catch(() => {});
            }
        } catch (_) {}
    };

    const renderSnapshot = async () => {
        if (!image || !image.src || !image.complete || image.naturalWidth === 0) return;
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const w = 360;
            const h = 160;
            canvas.width = w;
            canvas.height = h;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
            
            const previewW = 180;
            const previewH = 80;
            const imgW = image.naturalWidth;
            const imgH = image.naturalHeight;
            const scale = currentScale;
            
            let fitScale = Math.min(previewW / imgW, previewH / imgH);
            const displayW = imgW * fitScale * scale;
            const displayH = imgH * fitScale * scale;
            
            const canvasScale = w / previewW;
            const x = (w / 2) - (displayW * canvasScale / 2) + (currentX * canvasScale);
            const y = (h / 2) - (displayH * canvasScale / 2) + (currentY * canvasScale);
            
            ctx.drawImage(image, x, y, displayW * canvasScale, displayH * canvasScale);
            const snapshotUrl = canvas.toDataURL('image/jpeg', 0.75);
            try {
                localStorage.setItem(LOGO_KEY, snapshotUrl);
                localStorage.setItem(LEGACY_LOGO_KEY, snapshotUrl);
            } catch {}
            if (window.db?.profiles?.update) {
                try {
                    await window.db.profiles.update({ account_logo_url: snapshotUrl });
                } catch (err) {
                    if (window.SpendNoteDebug) console.warn('Logo snapshot DB update failed:', err);
                }
            }
        } catch (_) {}
    };

    const loadFromProfile = (profile) => {
        if (!profile) return;
        if (hasUserEdited) return;
        const dbLogo = profile.account_logo_url || '';
        if (dbLogo) {
            try {
                localStorage.setItem(LOGO_KEY, dbLogo);
                localStorage.setItem(LEGACY_LOGO_KEY, dbLogo);
            } catch {}
        }
        // Sync scale/position from DB
        const ls = profile.logo_settings;
        if (ls && typeof ls === 'object') {
            if (ls.scale != null) {
                try { localStorage.setItem(LOGO_SCALE_KEY, String(clampScale(ls.scale))); } catch {}
            }
            if (ls.x != null || ls.y != null) {
                try { localStorage.setItem(LOGO_POSITION_KEY, JSON.stringify({ x: Number(ls.x) || 0, y: Number(ls.y) || 0 })); } catch {}
            }
        }
        loadLogo();
    };

    const readPosition = () => {
        try {
            const s = localStorage.getItem(LOGO_POSITION_KEY);
            if (s) { const p = JSON.parse(s); return { x: Number(p.x) || 0, y: Number(p.y) || 0 }; }
        } catch {}
        return { x: 0, y: 0 };
    };

    const writePosition = () => {
        try { localStorage.setItem(LOGO_POSITION_KEY, JSON.stringify({ x: currentX, y: currentY })); } catch {}
        persistLogoSettings();
        scheduleSnapshot();
    };

    const applyTransform = () => {
        if (image) {
            image.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
        }
    };

    const updateInfo = () => {
        if (info) {
            info.textContent = `${Math.round(currentScale * 100)}%`;
        }
        applyTransform();
    };

    const setScale = (value) => {
        hasUserEdited = true;
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
            const pos = readPosition();
            currentX = pos.x;
            currentY = pos.y;
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
        hasUserEdited = true;
        writeLogo(null);
        if (preview) preview.classList.remove('has-logo');
        if (image) image.removeAttribute('src');
        currentScale = 1.0;
        currentX = 0;
        currentY = 0;
        writeScale(currentScale);
        writePosition();
        updateInfo();
    };

    const uploadLogo = (file) => {
        if (!file) return;
        hasUserEdited = true;
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
            if (image && preview) {
                image.onload = () => {
                    updateInfo();
                    scheduleSnapshot();
                    image.onload = null;
                };
                image.src = dataUrl;
                preview.classList.add('has-logo');
            }
            currentScale = 1.0;
            currentX = 0;
            currentY = 0;
            writeScale(currentScale);
            writePosition();
            updateInfo();
        };
        reader.readAsDataURL(file);
    };

    const init = () => {
        preview = document.getElementById('logoEditorCanvas');
        image = document.getElementById('logoEditorImage');
        info = document.getElementById('logoEditorInfo');

        if (!preview || !image) return;

        // Drag handlers
        preview.style.cursor = 'grab';
        preview.addEventListener('mousedown', (e) => {
            if (!preview.classList.contains('has-logo')) return;
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            imgStartX = currentX;
            imgStartY = currentY;
            preview.style.cursor = 'grabbing';
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            currentX = imgStartX + (e.clientX - dragStartX);
            currentY = imgStartY + (e.clientY - dragStartY);
            applyTransform();
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                hasUserEdited = true;
                preview.style.cursor = 'grab';
                writePosition();
            }
        });

        // Zoom +/- buttons
        const zoomIn = document.getElementById('logoZoomIn');
        const zoomOut = document.getElementById('logoZoomOut');

        if (zoomIn) {
            zoomIn.addEventListener('click', () => setScale(currentScale + STEP));
        }
        if (zoomOut) {
            zoomOut.addEventListener('click', () => setScale(currentScale - STEP));
        }

        // Upload/Remove
        const uploadBtn = document.getElementById('logoUploadBtn');
        const removeBtn = document.getElementById('logoRemoveBtn');
        const fileInput = document.getElementById('logoFileInput');

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                try { fileInput.value = ''; } catch (_) {}
                fileInput.click();
            });
        }
        if (removeBtn) {
            removeBtn.addEventListener('click', removeLogo);
        }
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target?.files?.[0];
                if (file) uploadLogo(file);
                try { e.target.value = ''; } catch (_) {}
            });
        }

        // Load initial logo
        loadLogo();
    };

    return { init, loadLogo, removeLogo, uploadLogo, loadFromProfile };
})();

// Export for manual initialization
window.LogoEditor = LogoEditor;
