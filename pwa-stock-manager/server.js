const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stock-manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database');
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Item Schema
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  sku: { type: String, unique: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  description: String,
  threshold: { type: Number, default: 5, min: 1 },
  status: { type: String, enum: ['in-stock', 'low-stock', 'out-of-stock'], default: 'in-stock' },
  value: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  color: { type: String, default: '#2196f3' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  itemCount: { type: Number, default: 0 }
});

const Category = mongoose.model('Category', categorySchema);

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'stock-manager-secret-key');
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// User registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'stock-manager-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// User login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'stock-manager-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user endpoint
app.get('/api/auth/me', authenticate, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Items endpoints
// Create item
app.post('/api/items', authenticate, async (req, res) => {
  try {
    const { name, category, sku, quantity, price, description, threshold } = req.body;

    // Calculate value and status
    const value = quantity * price;
    let status = 'in-stock';
    if (quantity === 0) status = 'out-of-stock';
    else if (quantity <= (threshold || 5)) status = 'low-stock';

    // Create item
    const item = new Item({
      name,
      category,
      sku: sku || `SKU-${Date.now()}`,
      quantity,
      price,
      description,
      threshold: threshold || 5,
      value,
      status,
      createdBy: req.user._id
    });

    await item.save();

    // Update category item count
    await Category.findOneAndUpdate(
      { name: category },
      { $inc: { itemCount: 1 } },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: 'Item created successfully',
      item
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Server error creating item' });
  }
});

// Get all items
app.get('/api/items', authenticate, async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Item.find(query).sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Server error fetching items' });
  }
});

// Get single item
app.get('/api/items/:id', authenticate, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Server error fetching item' });
  }
});

// Update item
app.put('/api/items/:id', authenticate, async (req, res) => {
  try {
    const { name, category, sku, quantity, price, description, threshold } = req.body;

    // Calculate value and status
    const value = quantity * price;
    let status = 'in-stock';
    if (quantity === 0) status = 'out-of-stock';
    else if (quantity <= (threshold || 5)) status = 'low-stock';

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        sku,
        quantity,
        price,
        description,
        threshold: threshold || 5,
        value,
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Server error updating item' });
  }
});

// Delete item
app.delete('/api/items/:id', authenticate, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Update category item count
    await Category.findOneAndUpdate(
      { name: item.category },
      { $inc: { itemCount: -1 } }
    );

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Server error deleting item' });
  }
});

// Categories endpoints
// Create category
app.post('/api/categories', authenticate, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const category = new Category({
      name,
      description,
      color: color || '#2196f3',
      createdBy: req.user._id
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error creating category' });
  }
});

// Get all categories
app.get('/api/categories', authenticate, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});

// Dashboard statistics
app.get('/api/dashboard/stats', authenticate, async (req, res) => {
  try {
    const items = await Item.find();
    
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + item.value, 0);
    const lowStockItems = items.filter(item => item.status === 'low-stock').length;
    const categoriesCount = await Category.countDocuments();

    // Category distribution
    const categoryDistribution = await Category.aggregate([
      {
        $lookup: {
          from: 'items',
          localField: 'name',
          foreignField: 'category',
          as: 'categoryItems'
        }
      },
      {
        $project: {
          name: 1,
          color: 1,
          count: { $size: '$categoryItems' },
          value: { $sum: '$categoryItems.value' }
        }
      }
    ]);

    // Stock status distribution
    const stockStatus = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      stats: {
        totalItems,
        totalValue,
        lowStockItems,
        categoriesCount
      },
      categoryDistribution,
      stockStatus
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error fetching dashboard stats' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'IT Stock Manager API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
});