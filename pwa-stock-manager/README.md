# IT Stock Manager - Progressive Web App

A modern, offline-capable Progressive Web App (PWA) for managing IT company stock inventory.

## Features

### Core Features
- 📱 **PWA First**: Installable app with offline capabilities
- 📊 **Real-time Dashboard**: View stock statistics at a glance
- 📦 **Inventory Management**: Add, edit, delete, and search stock items
- 🗂️ **Category Management**: Organize items by categories
- 📈 **Reports & Analytics**: Visual charts for stock analysis
- ⚙️ **Settings & Configuration**: Customize app behavior

### Advanced Features
- 🔄 **Offline Support**: Works without internet connection
- 📡 **Background Sync**: Syncs data when back online
- 🔔 **Push Notifications**: Get notified about low stock items
- 💾 **Data Import/Export**: Backup and restore your data
- 🎨 **Responsive Design**: Works on desktop, tablet, and mobile
- 🌙 **Dark Mode Support**: Easy on the eyes

## Technology Stack

### Frontend
- **HTML5** - Modern semantic markup
- **CSS3** - Custom design with CSS variables for theming
- **JavaScript (ES6+)** - Vanilla JS with modern features
- **IndexedDB** - Client-side storage for offline data
- **Service Workers** - Offline capabilities and background sync
- **Chart.js** - Data visualization for reports

### PWA Features
- **Web App Manifest** - Installable app with splash screen
- **Service Worker** - Caching, offline support, push notifications
- **IndexedDB** - Persistent local storage
- **Background Sync** - Data synchronization
- **Push API** - Desktop notifications

## Installation

### Option 1: Local Development
1. Clone the repository or download the files
2. Open `index.html` in a modern web browser
3. Enable "Allow service workers" in browser settings (if prompted)

### Option 2: Deploy to Web Server
1. Upload all files to a web server (HTTPS required for service workers)
2. Access the app via your domain
3. Browser will prompt to install as PWA (desktop/mobile)

## Usage Guide

### Adding Items
1. Click "Add Item" button
2. Fill in item details (name, category, quantity, price)
3. Click "Add Item" to save

### Managing Categories
1. Switch to "Categories" tab
2. Click "Add Category" to create new categories
3. Use category filters to organize items

### Viewing Reports
1. Switch to "Reports" tab
2. View stock status charts
3. Analyze category distribution

### Offline Usage
- The app automatically saves data locally
- Works even without internet connection
- Syncs data when connection is restored

## File Structure

```
pwa-stock-manager/
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
├── README.md          # This file
├── css/
│   └── style.css      # All styles
└── js/
    └── app.js         # Main application logic
```

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 58+
- ✅ Safari 11.3+
- ✅ Edge 79+
- ✅ Opera 47+

## API Endpoints (Future Implementation)

The app is designed to work with a backend API. Currently, it uses IndexedDB for local storage, but can be extended with:

```
POST   /api/items        # Create new item
GET    /api/items        # List all items
GET    /api/items/:id    # Get specific item
PUT    /api/items/:id    # Update item
DELETE /api/items/:id    # Delete item
POST   /api/sync         # Sync offline data
```

## Development

### Prerequisites
- Modern web browser
- Code editor (VS Code, Sublime Text, etc.)
- Local web server (optional, for testing service workers)

### Getting Started
1. Open the project folder in your code editor
2. Modify files as needed:
   - Update colors in `css/style.css`
   - Add features in `js/app.js`
   - Customize PWA settings in `manifest.json`

### Testing PWA Features
- Use Chrome DevTools > Application > Service Workers
- Test offline mode using DevTools > Application > Service Workers > "Offline"
- Verify manifest in DevTools > Application > Manifest

## Performance Features

- ⚡ **Lazy Loading**: Loads resources as needed
- 🗃️ **Efficient Caching**: Intelligent service worker caching strategy
- 📦 **Code Splitting**: Modular JavaScript structure
- 🎯 **Optimized Images**: Placeholder for future image optimization

## Security Features

- 🔒 **Local Storage**: Data stays on user's device
- 🛡️ **Input Validation**: Client-side form validation
- 📝 **Data Sanitization**: Prevents XSS attacks
- 🔐 **HTTPS Ready**: Service workers require HTTPS in production

## Future Enhancements

1. **Multi-user Support**: User accounts and permissions
2. **Barcode Scanning**: Scan barcodes with camera
3. **Supplier Management**: Track suppliers and orders
4. **Audit Trail**: Track all inventory changes
5. **Mobile Apps**: Wrap as native app using Capacitor/Cordova
6. **API Integration**: Connect to ERP systems
7. **Advanced Analytics**: Predictive stock analysis
8. **Multi-language Support**: Internationalization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - Free to use and modify for personal and commercial projects.

## Support

For issues or questions:
1. Check the [GitHub Issues](https://github.com/yourusername/pwa-stock-manager/issues)
2. Search for similar problems
3. Create a new issue with details

## Credits

- Built with modern web technologies
- Designed for IT companies and inventory management
- Inspired by best practices in PWA development

---

**Note**: This is a working PWA prototype. For production use, consider:
- Adding a backend server for data persistence across devices
- Implementing user authentication
- Adding more robust error handling
- Setting up continuous integration/deployment

---

Made with ❤️ for IT inventory management