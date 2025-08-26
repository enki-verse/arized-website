const fs = require('fs');
const path = require('path');

// Get all exhibition HTML files
const exhibitionFiles = [
    'exhibition-odd-i-see.html',
    'exhibition-walpurgis-nebulah.html',
    'exhibition-bone-and-boundary.html',
    'exhibition-icecream-apocalypse.html',
    'exhibition-life-world.html',
    'exhibition-the-universe-is-leaking.html'
];

function fixExhibitionPage(filePath) {
    console.log(`Fixing ${filePath}...`);

    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add exhibitionArtworks as global variable
    content = content.replace(
        'let artworks = [];',
        'let artworks = [];\n        let exhibitionArtworks = []; // Global variable for lightbox navigation'
    );

    // 2. Make exhibitionArtworks assignment global
    content = content.replace(
        '            // Filter artworks to only those in this exhibition\n            const exhibitionArtworks = artworks.filter(artwork =>',
        '            // Filter artworks to only those in this exhibition\n            exhibitionArtworks = artworks.filter(artwork =>'
    );

    // 3. Remove the redirecting viewArtworkInLightbox function
    content = content.replace(
        '        // View artwork in lightbox\n        function viewArtworkInLightbox(artworkId) {\n            const artwork = artworks.find(a => a.id === artworkId);\n            if (!artwork) return;\n\n            // For now, redirect to artworks page with specific artwork\n            sessionStorage.setItem(\'selectedArtworkId\', artworkId);\n            window.location.href = \'artworks.html\';\n        }',
        ''
    );

    // 4. Add the setupLightboxEventHandlers function
    const setupFunction = `
        // Setup all lightbox event handlers
        function setupLightboxEventHandlers() {
            // Close lightbox
            document.getElementById('lightboxClose').addEventListener('click', closeLightbox);

            // Navigation buttons
            document.getElementById('prevBtn').addEventListener('click', () => navigateLightbox('prev'));
            document.getElementById('nextBtn').addEventListener('click', () => navigateLightbox('next'));

            // Zoom controls
            document.getElementById('zoomIn').addEventListener('click', () => {
                if (currentZoom < maxZoom) {
                    currentZoom += zoomStep;
                    updateImageZoom();
                }
            });

            document.getElementById('zoomOut').addEventListener('click', () => {
                if (currentZoom > minZoom) {
                    currentZoom -= zoomStep;
                    updateImageZoom();
                }
            });

            // Add to selection button
            document.getElementById('addToSelection').addEventListener('click', () => {
                if (currentViewingArtwork) {
                    addToSelection(currentViewingArtwork.id);
                }
            });

            // Save as PDF button
            document.getElementById('saveAsPDF').addEventListener('click', () => {
                const artworksToSave = isViewingSelection ? selectedArtworks : [currentViewingArtwork];
                if (artworksToSave.length > 0) {
                    generatePDF(artworksToSave);
                }
            });

            // Contact popup
            setupContactPopup();

            // Close on overlay click
            document.getElementById('lightbox').addEventListener('click', (e) => {
                if (e.target.id === 'lightbox') {
                    closeLightbox();
                }
            });

            // Keyboard navigation
            setupKeyboardNavigation();
        }
`;

    // Add setupLightboxEventHandlers before initializeGallery
    content = content.replace(
        '        // Initialize the gallery\n        async function initializeGallery() {',
        setupFunction + '\n        // Initialize the gallery\n        async function initializeGallery() {'
    );

    // 5. Add setupLightboxEventHandlers call in initializeGallery
    content = content.replace(
        '                // Render gallery and documentation\n                renderGallery();\n                renderDocumentation();',
        '                // Render gallery and documentation\n                renderGallery();\n                renderDocumentation();\n\n                // Setup lightbox event handlers\n                setupLightboxEventHandlers();'
    );

    // 6. Fix viewArtworkInLightbox to handle undefined exhibitionArtworks
    const viewFunction = `        // View artwork in lightbox
        function viewArtworkInLightbox(artworkId) {
            const artwork = artworks.find(a => a.id === artworkId);
            if (!artwork) return;

            // Ensure exhibitionArtworks is available
            if (typeof exhibitionArtworks === 'undefined' || !exhibitionArtworks) {
                console.warn('exhibitionArtworks not available yet, initializing...');
                // Try to initialize if not available
                if (exhibitionData.artworks && artworks.length > 0) {
                    exhibitionArtworks = artworks.filter(artwork =>
                        exhibitionData.artworks.includes(artwork.id) ||
                        (artwork.exhibitions && artwork.exhibitions.includes(exhibitionData.name))
                    );
                }
            }

            currentViewingArtwork = artwork;
            currentArtworkIndex = exhibitionArtworks ? exhibitionArtworks.findIndex(a => a.id === artworkId) : 0;
            isViewingSelection = false; // Individual artwork view

            // Hide navigation
            document.getElementById('navigation').classList.add('hidden');

            // Show lightbox
            const lightbox = document.getElementById('lightbox');
            lightbox.style.display = 'flex';

            updateLightboxImage();
            updateAddToSelectionButton();
            resetZoom();
        }`;

    // Find the correct location to replace - after the setupCardInteractions function
    content = content.replace(
        '        // Setup card interactions\n        function setupCardInteractions() {\n            document.querySelectorAll(\'.artwork-card\').forEach(card => {\n                // Click to view in lightbox (but don\'t add to selection)\n                card.addEventListener(\'click\', (e) => {\n                    viewArtworkInLightbox(card.dataset.id);\n                });\n            });\n        }',
        '        // Setup card interactions\n        function setupCardInteractions() {\n            document.querySelectorAll(\'.artwork-card\').forEach(card => {\n                // Click to view in lightbox (but don\'t add to selection)\n                card.addEventListener(\'click\', (e) => {\n                    viewArtworkInLightbox(card.dataset.id);\n                });\n            });\n        }\n' + viewFunction
    );

    // 7. Add contact status click handler
    content = content.replace(
        '            // Create status text with red dot for sold items or clickable available\n            if (status.class === \'sold\') {\n                lightboxStatus.innerHTML = `${status.text} <span class="status-dot"></span>`;\n                lightboxStatus.className = \'lightbox-status\';\n            } else if (status.class === \'available\') {\n                lightboxStatus.textContent = status.text;\n                lightboxStatus.className = \'lightbox-status available\';\n                lightboxStatus.style.cursor = \'pointer\';\n                lightboxStatus.title = \'Click to inquire about this artwork\';\n            } else {\n                lightboxStatus.textContent = status.text;\n                lightboxStatus.className = \'lightbox-status\';\n            }',
        '            // Create status text with red dot for sold items or clickable available\n            if (status.class === \'sold\') {\n                lightboxStatus.innerHTML = `${status.text} <span class="status-dot"></span>`;\n                lightboxStatus.className = \'lightbox-status\';\n                lightboxStatus.onclick = null; // Remove click handler\n            } else if (status.class === \'available\') {\n                lightboxStatus.textContent = status.text;\n                lightboxStatus.className = \'lightbox-status available\';\n                lightboxStatus.style.cursor = \'pointer\';\n                lightboxStatus.title = \'Click to inquire about this artwork\';\n                lightboxStatus.onclick = () => openContactPopup(currentViewingArtwork);\n            } else {\n                lightboxStatus.textContent = status.text;\n                lightboxStatus.className = \'lightbox-status\';\n                lightboxStatus.onclick = null; // Remove click handler\n            }'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
}

// Process all exhibition files
exhibitionFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        fixExhibitionPage(filePath);
    } else {
        console.log(`File not found: ${filePath}`);
    }
});

console.log('All exhibition pages have been fixed!');