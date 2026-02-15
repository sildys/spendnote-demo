// ===== MODERN LOGO EDITOR =====
// Interactive drag-to-position + zoom controls for logo preview

const LogoEditor = (() => {
    const LOGO_KEY = 'spendnote.proLogoDataUrl';
    const LEGACY_LOGO_KEY = 'spendnote.receipt.logo.v1';
    const LOGO_SCALE_KEY = 'spendnote.receipt.logoScale.v1';
    const LOGO_POSITION_KEY = 'spendnote.receipt.logoPosition.v1';

    let canvas = null;
    let viewport = null;
    let image = null;
    let info = null;
    let slider = null;

    let currentScale = 1.0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let imageStartX = 0;
    let imageStartY = 0;

    const clampScale = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return 1;
        return Math.min(2.0, Math.max(0.5, n));
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

    const readPosition = () => {
        try {
            const stored = localStorage.getItem(LOGO_POSITION_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return { x: Number(parsed.x) || 0, y: Number(parsed.y) || 0 };
            }
        } catch {}
        return { x: 0, y: 0 };
    };

    const writePosition = (x, y) => {
        try {
            localStorage.setItem(LOGO_POSITION_KEY, JSON.stringify({ x, y }));
        } catch {}
    };

    const updateImageTransform = () => {
        if (!image || !image.src) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        // If canvas is hidden or 0 size, try later
        if (canvasRect.width === 0 || canvasRect.height === 0) {
            requestAnimationFrame(updateImageTransform);
            return;
        }

        const naturalWidth = image.naturalWidth || 1;
        const naturalHeight = image.naturalHeight || 1;
        const aspectRatio = naturalWidth / naturalHeight;

        // Base size: fit 70% of canvas width
        let baseWidth = canvasRect.width * 0.7;
        let baseHeight = baseWidth / aspectRatio;

        // If too tall, fit to height instead
        if (baseHeight > canvasRect.height * 0.7) {
            baseHeight = canvasRect.height * 0.7;
            baseWidth = baseHeight * aspectRatio;
        }

        const scaledWidth = baseWidth * currentScale;
        const scaledHeight = baseHeight * currentScale;

        image.style.width = `${scaledWidth}px`;
        image.style.height = `${scaledHeight}px`;
        // Center + offset
        image.style.left = `${(canvasRect.width / 2) + currentX}px`;
        image.style.top = `${(canvasRect.height / 2) + currentY}px`;
        image.style.transform = 'translate(-50%, -50%)';

        if (info) {
            info.textContent = `${Math.round(currentScale * 100)}%`;
        }

        if (slider) {
            slider.value = String(Math.round(currentScale * 100));
        }
    };

    const setScale = (value) => {
        currentScale = clampScale(value);
        writeScale(currentScale);
        updateImageTransform();
    };

    const reset = () => {
        currentScale = 1.0;
        currentX = 0;
        currentY = 0;
        writeScale(currentScale);
        writePosition(currentX, currentY);
        updateImageTransform();
    };

    const loadLogo = () => {
        const stored = readLogo();
        if (stored && image && canvas) {
            // Reset state if needed
            if (!image.src || image.src !== stored) {
                image.src = stored;
            }
            
            canvas.classList.add('has-logo');
            currentScale = clampScale(readScale());
            const pos = readPosition();
            currentX = pos.x;
            currentY = pos.y;
            
            if (image.complete) {
                updateImageTransform();
            } else {
                image.onload = () => {
                    updateImageTransform();
                };
            }
        } else if (canvas) {
            canvas.classList.remove('has-logo');
            if (image) {
                image.removeAttribute('src');
                image.style.width = '';
                image.style.height = '';
            }
        }
    };

    const removeLogo = () => {
        writeLogo(null);
        if (canvas) canvas.classList.remove('has-logo');
        if (image) image.removeAttribute('src');
        reset();
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
            reset();
            loadLogo();
        };
        reader.readAsDataURL(file);
    };

    const handleMouseDown = (e) => {
        if (!canvas.classList.contains('has-logo')) return;
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        imageStartX = currentX;
        imageStartY = currentY;
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        currentX = imageStartX + dx;
        currentY = imageStartY + dy;
        updateImageTransform();
    };

    const handleMouseUp = () => {
        if (isDragging) {
            isDragging = false;
            writePosition(currentX, currentY);
        }
    };

    const handleWheel = (e) => {
        if (!canvas.classList.contains('has-logo')) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setScale(currentScale + delta);
    };

    const init = () => {
        canvas = document.getElementById('logoEditorCanvas');
        viewport = document.getElementById('logoEditorViewport');
        image = document.getElementById('logoEditorImage');
        info = document.getElementById('logoEditorInfo');
        slider = document.getElementById('logoZoomSlider');

        if (!canvas || !viewport || !image) return;

        // Drag handlers
        viewport.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Wheel zoom
        viewport.addEventListener('wheel', handleWheel, { passive: false });

        // Zoom controls
        const zoomIn = document.getElementById('logoZoomIn');
        const zoomOut = document.getElementById('logoZoomOut');
        const resetBtn = document.getElementById('logoResetBtn');

        if (zoomIn) {
            zoomIn.addEventListener('click', () => setScale(currentScale + 0.1));
        }

        if (zoomOut) {
            zoomOut.addEventListener('click', () => setScale(currentScale - 0.1));
        }

        if (slider) {
            slider.addEventListener('input', () => {
                setScale(Number(slider.value) / 100);
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', reset);
        }

        // Upload/Remove
        const uploadBtn = document.getElementById('logoUploadBtn');
        const removeBtn = document.getElementById('logoRemoveBtn');
        const fileInput = document.getElementById('logoFileInput');

        // Remove existing listeners to avoid duplicates
        const newUploadBtn = uploadBtn.cloneNode(true);
        uploadBtn.parentNode.replaceChild(newUploadBtn, uploadBtn);
        newUploadBtn.addEventListener('click', () => fileInput.click());

        const newRemoveBtn = removeBtn.cloneNode(true);
        removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);
        newRemoveBtn.addEventListener('click', removeLogo);

        const newFileInput = fileInput.cloneNode(true);
        fileInput.parentNode.replaceChild(newFileInput, fileInput);
        newFileInput.addEventListener('change', (e) => {
            const file = e.target?.files?.[0];
            if (file) uploadLogo(file);
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (canvas.classList.contains('has-logo')) {
                updateImageTransform();
            }
        });

        // Load initial logo
        loadLogo();
    };

    return { init, loadLogo, removeLogo, uploadLogo };
})();

// Export for manual initialization
window.LogoEditor = LogoEditor;
