// ===== GALLERY FUNCTIONALITY =====
const GITHUB_REPO = 'enki-verse/arized-website';
let artworks = [];
let filteredArtworks = [];

// Load artworks
async function loadArtworks() {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/data/artworks.json`);
        const data = await response.json();
        artworks = data.artworks;
        filteredArtworks = [...artworks];
        renderGallery();
        setupFilters();
    } catch (error) {
        console.error('Error loading artworks:', error);
        document.getElementById('galleryGrid').innerHTML = 
            '<p class="loading">Error loading artworks. Please try again later.</p>';
    }
}

// Render gallery
function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    
    if (filteredArtworks.length === 0) {
        grid.innerHTML = '<p class="loading">No artworks found.</p>';
        return;
    }
    
    grid.innerHTML = filteredArtworks.map(artwork => `
        <div class="artwork-card" data-id="${artwork.id}">
            <img src="https://raw.githubusercontent.com/${GITHUB_REPO}/main/${artwork.images.medium}"
                 alt="${artwork.title}"
                 class="artwork-image">
            <div class="artwork-info">
                <h3 class="artwork-title">${artwork.title}</h3>
                <p class="artwork-details">${artwork.dimensions}</p>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.artwork-card').forEach(card => {
        card.addEventListener('click', () => openLightbox(card.dataset.id));
    });
}

// Setup filters
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter artworks
            const filter = btn.dataset.filter;
            filterArtworks(filter);
        });
    });
}

// Filter artworks
function filterArtworks(filter) {
    switch(filter) {
        case 'available':
            filteredArtworks = artworks.filter(a => a.available && a.forSale);
            break;
        case 'featured':
            filteredArtworks = artworks.filter(a => a.featured);
            break;
        default:
            filteredArtworks = [...artworks];
    }
    renderGallery();
}

// Format price for display
function formatPrice(price) {
    if (!price) return 'Price on request';
    return `$${price.toLocaleString()}`;
}

// Lightbox functionality
let currentZoom = 1;
const minZoom = 0.5;
const maxZoom = 3;
const zoomStep = 0.25;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let imageX = 0;
let imageY = 0;
const panStep = 20; // pixels to move with keyboard

function openLightbox(artworkId) {
    const artwork = artworks.find(a => a.id === artworkId);
    if (!artwork) return;
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDetails = document.getElementById('lightboxDetails');
    const lightboxPrice = document.getElementById('lightboxPrice');
    
    lightboxImage.src = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${artwork.images.large}`;
    lightboxImage.alt = artwork.title;
    lightboxTitle.textContent = artwork.title;
    lightboxDetails.textContent = `${artwork.year} • ${artwork.medium} • ${artwork.dimensions}`;
    
    if (artwork.available && artwork.forSale) {
        lightboxPrice.textContent = formatPrice(artwork.price);
    } else {
        lightboxPrice.textContent = 'Not for sale';
    }
    
    // Reset zoom and position
    currentZoom = 1;
    imageX = 0;
    imageY = 0;
    updateImageZoom();
    
    // Add drag and keyboard event listeners
    setupDragListeners();
    setupKeyboardListeners();
    
    lightbox.style.display = 'flex';
}

function updateImageZoom() {
    const lightboxImage = document.getElementById('lightboxImage');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    
    lightboxImage.style.transform = `scale(${currentZoom}) translate(${imageX}px, ${imageY}px)`;
    
    // Update button states
    zoomInBtn.disabled = currentZoom >= maxZoom;
    zoomOutBtn.disabled = currentZoom <= minZoom;
    
    // Update cursor based on zoom level
    if (currentZoom > 1) {
        lightboxImage.classList.add('zoomed');
    } else {
        lightboxImage.classList.remove('zoomed');
    }
}

function zoomIn() {
    if (currentZoom < maxZoom) {
        currentZoom += zoomStep;
        updateImageZoom();
    }
}

function zoomOut() {
    if (currentZoom > minZoom) {
        currentZoom -= zoomStep;
        updateImageZoom();
    }
}

function setupDragListeners() {
    const lightboxImage = document.getElementById('lightboxImage');
    
    lightboxImage.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events for mobile
    lightboxImage.addEventListener('touchstart', startDragTouch);
    document.addEventListener('touchmove', dragTouch);
    document.addEventListener('touchend', endDrag);
}

function setupKeyboardListeners() {
    document.addEventListener('keydown', handleKeyboard);
}

function removeKeyboardListeners() {
    document.removeEventListener('keydown', handleKeyboard);
}

function handleKeyboard(e) {
    if (document.getElementById('lightbox').style.display === 'none') return;
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            if (currentZoom > 1) {
                imageX += panStep;
                updateImageZoom();
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (currentZoom > 1) {
                imageX -= panStep;
                updateImageZoom();
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (currentZoom > 1) {
                imageY += panStep;
                updateImageZoom();
            }
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (currentZoom > 1) {
                imageY -= panStep;
                updateImageZoom();
            }
            break;
        case 'Escape':
            e.preventDefault();
            closeLightbox();
            break;
        case '+':
        case '=':
            e.preventDefault();
            zoomIn();
            break;
        case '-':
            e.preventDefault();
            zoomOut();
            break;
    }
}

function startDrag(e) {
    if (currentZoom <= 1) return;
    
    isDragging = true;
    dragStartX = e.clientX - imageX;
    dragStartY = e.clientY - imageY;
    e.preventDefault();
}

function drag(e) {
    if (!isDragging || currentZoom <= 1) return;
    
    imageX = e.clientX - dragStartX;
    imageY = e.clientY - dragStartY;
    updateImageZoom();
    e.preventDefault();
}

function startDragTouch(e) {
    if (currentZoom <= 1) return;
    
    isDragging = true;
    const touch = e.touches[0];
    dragStartX = touch.clientX - imageX;
    dragStartY = touch.clientY - imageY;
    e.preventDefault();
}

function dragTouch(e) {
    if (!isDragging || currentZoom <= 1) return;
    
    const touch = e.touches[0];
    imageX = touch.clientX - dragStartX;
    imageY = touch.clientY - dragStartY;
    updateImageZoom();
    e.preventDefault();
}

function endDrag() {
    isDragging = false;
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
    removeKeyboardListeners();
}

// Close lightbox
document.querySelector('.lightbox .close').addEventListener('click', closeLightbox);

document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') {
        closeLightbox();
    }
});

// Zoom controls
document.getElementById('zoomIn').addEventListener('click', zoomIn);
document.getElementById('zoomOut').addEventListener('click', zoomOut);

// Initialize
document.addEventListener('DOMContentLoaded', loadArtworks);
