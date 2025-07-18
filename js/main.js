// ===== NAVIGATION FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navigation = document.getElementById('navigation');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', function() {
            navigation.classList.toggle('active');
            
            // Animate hamburger
            const spans = this.querySelectorAll('span');
            spans[0].style.transform = navigation.classList.contains('active')
                ? 'rotate(-45deg) translate(-5px, 6px)' : '';
            spans[1].style.opacity = navigation.classList.contains('active') ? '0' : '1';
            spans[2].style.transform = navigation.classList.contains('active')
                ? 'rotate(45deg) translate(-5px, -6px)' : '';
        });
        
        // Close menu when clicking on a link (mobile only)
        if (navMenu) {
            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        navigation.classList.remove('active');
                        const spans = menuToggle.querySelectorAll('span');
                        spans[0].style.transform = '';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = '';
                    }
                });
            });
        }
        
        // Close menu when clicking outside (mobile only)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                !menuToggle.contains(e.target) &&
                !navigation.contains(e.target) &&
                navigation.classList.contains('active')) {
                navigation.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
            }
        });
    }
});

// ===== UTILITY FUNCTIONS =====
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// ===== IMAGE LOADING =====
function loadImage(src, callback) {
    const img = new Image();
    img.onload = callback;
    img.src = src;
}
