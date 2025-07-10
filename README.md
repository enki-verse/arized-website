# Ari Zed Artist Website

A minimalist, professional artist website for showcasing and selling visionary artwork.

## Quick Start

### 1. Set Up GitHub Repository

1. Create a new repository on GitHub
2. Upload these files:
   - `/admin/index.html` - Admin interface for uploading artworks
   - `/data/artworks.json` - Artwork database
   - `/index.html` - Landing page
   - Create empty folders for images

### 2. Configure Admin Panel

Update these settings in `/admin/index.html`:

```javascript
const CONFIG = {
    password: 'your-secure-password',
    githubRepo: 'your-username/your-repo-name',
    githubToken: 'your-github-personal-access-token'
};
```

### 3. Deploy to Netlify

1. Connect your GitHub repo to Netlify
2. Deploy (no build settings needed)
3. Add custom domain (arized.art)

### 4. Start Uploading Artworks

1. Go to `yoursite.com/admin/`
2. Enter password
3. Upload artwork images
4. Fill in details
5. Click "Publish"

## Features

- **No Backend Required** - Everything runs in the browser
- **GitHub Storage** - Free image and data hosting
- **Automatic Image Resizing** - Creates 3 sizes for optimal loading
- **Mobile Responsive** - Works on all devices
- **Fast Loading** - Static site with CDN delivery

## File Structure

```
/
├── admin/
│   └── index.html          # Admin interface
├── data/
│   └── artworks.json       # Artwork database
├── images/
│   └── artworks/
│       ├── thumbnails/     # 400px images
│       ├── medium/         # 800px images
│       └── large/          # 1600px images
├── css/                    # Stylesheets (coming soon)
├── js/                     # JavaScript (coming soon)
├── index.html              # Landing page
├── artworks.html           # Gallery (coming soon)
├── about.html              # About page (coming soon)
└── contact.html            # Contact (coming soon)
```

## Development Phases

- [x] **Phase 1**: Admin Interface (Complete)
- [ ] **Phase 2**: Core Site Structure
- [ ] **Phase 3**: Gallery Features
- [ ] **Phase 4**: E-commerce Integration

## Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Data**: JSON files in GitHub
- **Images**: GitHub + browser-based resizing
- **Hosting**: Netlify (free)
- **Domain**: arized.art

## Adding GitHub Upload Functionality

To enable direct uploads to GitHub from the admin panel:

1. Copy the code from `github-upload-functions.js`
2. Add it to your `admin/index.html` file
3. Make sure your GitHub token has `repo` permissions

## Support

For issues or questions:
- Check browser console for errors
- Ensure GitHub token has correct permissions
- Verify all folder paths exist in repository

## License

© 2024 Ari Zed. All rights reserved.
