/**
 * Netlify PWA Fix - Provides localStorage fallback for StockManager
 * Intercepts class definition to patch prototype before instance creation
 */

(function() {
    'use strict';
    console.log('Netlify Fix: Starting...');

    // Poll for StockManager - class declarations create a global binding
    var timer = setInterval(function() {
        if (typeof StockManager !== 'undefined' && StockManager && StockManager.prototype) {
            clearInterval(timer);
            console.log('Netlify Fix: StockManager found, applying patches...');
            patchStockManager(StockManager);
        }
    }, 1);

    setTimeout(function() {
        clearInterval(timer);
    }, 10000);

    function patchStockManager(SM) {
        var originalInitDB = SM.prototype.initDatabase;
        SM.prototype.initDatabase = async function() {
            try {
                return await originalInitDB.call(this);
            } catch (e) {
                console.warn('Netlify Fix: IndexedDB failed, using localStorage:', e.message);
                this.db = null;
                return null;
            }
        };

        var originalLoadItems = SM.prototype.loadItems;
        SM.prototype.loadItems = async function() {
            if (this.db !== null) return originalLoadItems.call(this);
            var data = localStorage.getItem('stockManagerItems');
            this.items = data ? JSON.parse(data) : [];
            if (this.items.length === 0) {
                this.items = getSampleItems();
                localStorage.setItem('stockManagerItems', JSON.stringify(this.items));
            }
            return this.items;
        };

        var originalLoadCats = SM.prototype.loadCategories;
        SM.prototype.loadCategories = async function() {
            if (this.db !== null) return originalLoadCats.call(this);
            var data = localStorage.getItem('stockManagerCats');
            this.categories = data ? JSON.parse(data) : [];
            if (this.categories.length === 0) {
                this.categories = getDefaultCats();
                localStorage.setItem('stockManagerCats', JSON.stringify(this.categories));
            }
            return this.categories;
        };

        var originalSaveItem = SM.prototype.saveItem;
        SM.prototype.saveItem = async function(item) {
            item.value = item.quantity * item.price;
            item.status = this.calculateItemStatus(item.quantity, item.threshold || 5);
            if (this.db !== null) return originalSaveItem.call(this, item);
            item.id = Date.now() + Math.random();
            this.items.push(item);
            localStorage.setItem('stockManagerItems', JSON.stringify(this.items));
            return item;
        };

        var originalAddCat = SM.prototype.addCategory;
        SM.prototype.addCategory = async function(cat) {
            if (this.db !== null) return originalAddCat.call(this, cat);
            cat.id = Date.now() + Math.random();
            this.categories.push(cat);
            localStorage.setItem('stockManagerCats', JSON.stringify(this.categories));
            return cat;
        };

        // Add missing methods
        SM.prototype.showNotification = function(msg, type) {
            var bg = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3';
            var t = document.createElement('div');
            t.textContent = msg;
            t.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:12px 24px;border-radius:8px;background:' + bg + ';color:white;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:Inter,sans-serif;font-size:14px;animation:slideIn .3s ease';
            document.body.appendChild(t);
            setTimeout(function() { t.remove(); }, 3000);
        };

        SM.prototype.showModal = function(id) {
            var m = document.getElementById(id);
            if (m) m.style.display = 'flex';
        };

        SM.prototype.hideAllModals = function() {
            document.querySelectorAll('.modal').forEach(function(m) { m.style.display = 'none'; });
        };

        SM.prototype.switchTab = function(id) {
            document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
            var tb = document.querySelector('.tab[data-tab="' + id + '"]');
            if (tb) tb.classList.add('active');
            document.querySelectorAll('.tab-pane').forEach(function(p) { p.classList.remove('active'); });
            var pn = document.getElementById(id + 'Tab');
            if (pn) pn.classList.add('active');
        };

        SM.prototype.updateDashboard = function() {
            var el1 = document.getElementById('totalItems');
            var el2 = document.getElementById('lowStockItems');
            var el3 = document.getElementById('totalValue');
            var el4 = document.getElementById('categories');
            if (el1) el1.textContent = this.items.length;
            if (el4) el4.textContent = this.categories.length;
            if (el3) el3.textContent = '$' + this.items.reduce(function(s, i) { return s + (i.value || i.quantity * i.price || 0); }, 0).toFixed(2);
            if (el2) el2.textContent = this.items.filter(function(i) { return i.status === 'low-stock' || i.quantity <= (i.threshold || 5); }).length;
        };

        SM.prototype.updateCharts = function() {
            try {
                if (this.charts && this.charts.stockChart) {
                    var d = this.charts.stockChart.data.datasets[0];
                    d.data = [this.items.filter(function(i) { return i.status === 'in-stock'; }).length, this.items.filter(function(i) { return i.status === 'low-stock'; }).length, this.items.filter(function(i) { return i.status === 'out-of-stock'; }).length];
                    this.charts.stockChart.update();
                }
                if (this.charts && this.charts.categoryChart && this.categories.length) {
                    var c = this.charts.categoryChart;
                    var sm = this;
                    c.data.labels = this.categories.map(function(c) { return c.name; });
                    c.data.datasets[0].data = this.categories.map(function(c) { return sm.items.filter(function(i) { return i.category === c.name; }).length; });
                    c.data.datasets[0].backgroundColor = this.categories.map(function(c) { return c.color || '#2196f3'; });
                    c.update();
                }
            } catch(e) {}
        };

        SM.prototype.checkNetworkStatus = function() { this.updateNetworkStatus(navigator.onLine); };
        SM.prototype.updateNetworkStatus = function(online) {
            var el = document.getElementById('offlineIndicator');
            if (el) el.style.display = online ? 'none' : 'flex';
        };

        SM.prototype.editItem = function(id) {
            var item = this.items.find(function(i) { return i.id === id; });
            if (!item) return;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemCategory').value = item.category;
            document.getElementById('itemSKU').value = item.sku || '';
            document.getElementById('itemQuantity').value = item.quantity;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemDescription').value = item.description || '';
            document.getElementById('itemThreshold').value = item.threshold || 5;
            var h = document.querySelector('#addItemModal .modal-header h2');
            if (h) h.textContent = 'Edit Item';
            var _this = this;
            document.getElementById('addItemForm').onsubmit = function(e) {
                e.preventDefault();
                _this.updateItem(id);
            };
            this.showModal('addItemModal');
        };

        SM.prototype.updateItem = async function(id) {
            var idx = this.items.findIndex(function(i) { return i.id === id; });
            if (idx === -1) return;
            var q = parseInt(document.getElementById('itemQuantity').value) || 0;
            var p = parseFloat(document.getElementById('itemPrice').value) || 0;
            var t = parseInt(document.getElementById('itemThreshold').value) || 5;
            this.items[idx] = {
                ...this.items[idx],
                name: document.getElementById('itemName').value,
                category: document.getElementById('itemCategory').value,
                sku: document.getElementById('itemSKU').value,
                quantity: q,
                price: p,
                description: document.getElementById('itemDescription').value,
                threshold: t,
                value: q * p,
                status: q === 0 ? 'out-of-stock' : q <= t ? 'low-stock' : 'in-stock',
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('stockManagerItems', JSON.stringify(this.items));
            document.querySelector('#addItemModal .modal-header h2').textContent = 'Add New Item';
            document.getElementById('addItemForm').reset();
            this.hideAllModals();
            this.renderInventoryTable();
            this.renderCategoriesGrid();
            this.updateDashboard();
            this.updateCharts();
            this.showNotification('Item updated!', 'success');
        };

        SM.prototype.deleteItem = async function(id) {
            if (!confirm('Delete this item?')) return;
            this.items = this.items.filter(function(i) { return i.id !== id; });
            localStorage.setItem('stockManagerItems', JSON.stringify(this.items));
            this.renderInventoryTable();
            this.renderCategoriesGrid();
            this.updateDashboard();
            this.updateCharts();
            this.showNotification('Item deleted!', 'success');
        };

        SM.prototype.deleteCategory = async function(id) {
            if (!confirm('Delete this category?')) return;
            var cat = this.categories.find(function(c) { return c.id === id; });
            if (!cat) return;
            this.categories = this.categories.filter(function(c) { return c.id !== id; });
            localStorage.setItem('stockManagerCats', JSON.stringify(this.categories));
            this.populateCategorySelects();
            this.renderCategoriesGrid();
            this.showNotification('Category deleted!', 'success');
        };

        SM.prototype.filterByCategory = function(name) {
            var el = document.getElementById('categoryFilter');
            if (el) el.value = name;
            this.filterItems();
        };

        SM.prototype.syncData = function() {
            this.updateDashboard();
            this.renderInventoryTable();
            this.showNotification('Data synced!', 'info');
        };

        SM.prototype.exportData = function() {
            var d = { items: this.items, categories: this.categories, exportedAt: new Date().toISOString() };
            var b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
            var u = URL.createObjectURL(b);
            var a = document.createElement('a');
            a.href = u;
            a.download = 'stock-export-' + Date.now() + '.json';
            a.click();
            URL.revokeObjectURL(u);
            this.showNotification('Data exported!', 'success');
        };

        SM.prototype.importData = function() {
            var _this = this;
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async function(e) {
                var file = e.target.files[0];
                if (!file) return;
                try {
                    var text = await file.text();
                    var data = JSON.parse(text);
                    if (data.items) { _this.items = data.items; localStorage.setItem('stockManagerItems', JSON.stringify(_this.items)); }
                    if (data.categories) { _this.categories = data.categories; localStorage.setItem('stockManagerCats', JSON.stringify(_this.categories)); }
                    _this.populateCategorySelects();
                    _this.renderInventoryTable();
                    _this.renderCategoriesGrid();
                    _this.updateDashboard();
                    _this.updateCharts();
                    _this.showNotification('Data imported!', 'success');
                } catch(err) { _this.showNotification('Import error: ' + err.message, 'error'); }
            };
            input.click();
        };

        SM.prototype.clearData = function() {
            if (!confirm('Clear ALL data? Cannot be undone!')) return;
            this.items = [];
            this.categories = [];
            localStorage.removeItem('stockManagerItems');
            localStorage.removeItem('stockManagerCats');
            this.populateCategorySelects();
            this.renderInventoryTable();
            this.renderCategoriesGrid();
            this.updateDashboard();
            this.updateCharts();
            this.showNotification('Data cleared!', 'info');
        };

        console.log('Netlify Fix: Patches applied!');
    }

    function getSampleItems() {
        return [
            { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptops', sku: 'SKU-001', quantity: 15, price: 1299.99, description: 'High-performance laptop', threshold: 5, status: 'in-stock', value: 19499.85, createdAt: new Date().toISOString() },
            { id: 2, name: 'Wireless Mouse MX Master', category: 'Mice', sku: 'SKU-002', quantity: 3, price: 79.99, description: 'Premium wireless mouse', threshold: 5, status: 'low-stock', value: 239.97, createdAt: new Date().toISOString() },
            { id: 3, name: '27\" 4K Monitor', category: 'Monitors', sku: 'SKU-003', quantity: 8, price: 449.99, description: '4K UHD Monitor', threshold: 3, status: 'in-stock', value: 3599.92, createdAt: new Date().toISOString() },
            { id: 4, name: 'Mechanical Keyboard', category: 'Keyboards', sku: 'SKU-004', quantity: 0, price: 149.99, description: 'RGB keyboard', threshold: 5, status: 'out-of-stock', value: 0, createdAt: new Date().toISOString() },
            { id: 5, name: 'Network Switch 24-Port', category: 'Networking', sku: 'SKU-005', quantity: 12, price: 199.99, description: 'Gigabit switch', threshold: 4, status: 'in-stock', value: 2399.88, createdAt: new Date().toISOString() }
        ];
    }

    function getDefaultCats() {
        return [
            { id: 1, name: 'Laptops', description: 'Laptop computers', color: '#2196f3' },
            { id: 2, name: 'Desktops', description: 'Desktop computers', color: '#4caf50' },
            { id: 3, name: 'Monitors', description: 'Computer monitors', color: '#ff9800' },
            { id: 4, name: 'Keyboards', description: 'Computer keyboards', color: '#9c27b0' },
            { id: 5, name: 'Mice', description: 'Computer mice', color: '#f44336' },
            { id: 6, name: 'Networking', description: 'Network equipment', color: '#00bcd4' },
            { id: 7, name: 'Printers', description: 'Printers and scanners', color: '#8bc34a' },
            { id: 8, name: 'Accessories', description: 'Other accessories', color: '#795548' }
        ];
    }

    // Add CSS animation
    var style = document.createElement('style');
    style.textContent = '@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}';
    document.head.appendChild(style);
})();