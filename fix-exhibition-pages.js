// Script to fix exhibition pages to use dynamic data loading
const fs = require('fs');
const path = require('path');

// List of exhibition pages to update
const exhibitionPages = [
    'exhibition-bone-and-boundary.html',
    'exhibition-icecream-apocalypse.html',
    'exhibition-life-world.html',
    'exhibition-odd-i-see.html',
    'exhibition-the-universe-is-leaking.html',
    'exhibition-walpurgis-nebulah.html'
];

function updateExhibitionPage(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace the embedded exhibition data with dynamic loading
        content = content.replace(
            /let exhibitionData = \{[\s\S]*?\};/m,
            'let exhibitionData = null; // Will be loaded dynamically'
        );

        // Update the getExhibitionIdFromURL function to extract from filename
        const oldGetIdFunction = `        // Get exhibition ID from URL parameter
        function getExhibitionIdFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('id');
        }`;

        const newGetIdFunction = `        // Get exhibition ID from URL parameter or filename
        function getExhibitionIdFromURL() {
            // First try URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            let exhibitionId = urlParams.get('id');

            // If no URL parameter, extract from filename
            if (!exhibitionId) {
                const path = window.location.pathname;
                const filename = path.split('/').pop();
                if (filename.startsWith('exhibition-') && filename.endsWith('.html')) {
                    exhibitionId = filename.replace('exhibition-', '').replace('.html', '');
                }
            }

            return exhibitionId;
        }`;

        content = content.replace(oldGetIdFunction, newGetIdFunction);

        // Update the initializeGallery function to load data dynamically
        const oldInitFunction = `        // Initialize the gallery
        async function initializeGallery() {
            try {
                // Use embedded exhibition data directly
                // exhibitionData is already defined at the top of the script

                // Load artworks data
                artworks = await loadArtworks();

                // Update exhibition display
                updateExhibitionDisplay();

                // Setup scale toggle
                setupScaleToggle();

                // Render gallery and documentation
                renderGallery();
                renderDocumentation();

                // Setup lightbox event handlers
                setupLightboxEventHandlers();

                // Setup lightbox event handlers
                setupLightboxEventHandlers();

            } catch (error) {
                console.error('Error initializing gallery:', error);
                document.getElementById('galleryGrid').innerHTML =
                    '<p class="loading">Error loading exhibition. Please try again later.</p>';
            }
        }`;

        const newInitFunction = `        // Initialize the gallery
        async function initializeGallery() {
            try {
                // Load exhibition data dynamically from documentation.json
                const exhibitionId = getExhibitionIdFromURL();
                if (exhibitionId) {
                    exhibitionData = await loadExhibitionData(exhibitionId);
                }

                // Load artworks data
                artworks = await loadArtworks();

                // Update exhibition display
                updateExhibitionDisplay();

                // Setup scale toggle
                setupScaleToggle();

                // Render gallery and documentation
                renderGallery();
                renderDocumentation();

                // Setup lightbox event handlers
                setupLightboxEventHandlers();

            } catch (error) {
                console.error('Error initializing gallery:', error);
                document.getElementById('galleryGrid').innerHTML =
                    '<p class="loading">Error loading exhibition. Please try again later.</p>';
            }
        }`;

        content = content.replace(oldInitFunction, newInitFunction);

        // Write the updated content back to the file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);

    } catch (error) {
        console.error(`Error updating ${filePath}:`, error.message);
    }
}

// Update all exhibition pages
exhibitionPages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (fs.existsSync(filePath)) {
        updateExhibitionPage(filePath);
    } else {
        console.log(`File not found: ${filePath}`);
    }
});

console.log('All exhibition pages have been updated to use dynamic data loading.');