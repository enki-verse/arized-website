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
                <p class="artwork-details">${artwork.year} • ${artwork.medium}</p>
                <p class="artwork-details">${artwork.dimensions}</p>
                ${artwork.available && artwork.forSale 
                    ? `<p class="artwork-price">${formatPrice(artwork.price)}</p>` 
                    : '<p class="artwork-details">Not for sale</p>'
                }
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

// Lightbox functionality
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
    
    lightbox.style.display = 'flex';
}

// Close lightbox
document.querySelector('.lightbox .close').addEventListener('click', () => {
    document.getElementById('lightbox').style.display = 'none';
});

document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') {
        e.target.style.display = 'none';
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', loadArtworks);
