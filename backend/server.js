const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_jwt_secret_key'; // In production, use env variables

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ecommerce-app')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });



// Middleware to verify JWT token and set req.user
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

 // Login route
app.post('/api/login', async (req, res) => {
  console.log('Login request body:', req.body);
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'Invalid username or password' });

  // For demo, plain text password check (not secure)
  if (user.password !== password) return res.status(400).json({ message: 'Invalid username or password' });

  const token = jwt.sign({ username: user.username, roles: user.roles }, JWT_SECRET);
  res.json({ token, roles: user.roles });
});

// Admin route to add user and change roles
app.post('/api/admin/users', authenticateToken, async (req, res) => {
  if (!req.user.roles || !req.user.roles.includes('admin')) return res.sendStatus(403);

  const { username, password, roles } = req.body;
  try {
    const newUser = new User({ username, password, roles });
    await newUser.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err.message });
  }
});

// Admin route to get all users
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  if (!req.user.roles || !req.user.roles.includes('admin')) return res.sendStatus(403);

  try {
    const users = await User.find({}, 'username roles');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Admin route to update user role
app.put('/api/admin/users/:username/role', authenticateToken, async (req, res) => {
  if (!req.user.roles || !req.user.roles.includes('admin')) return res.sendStatus(403);

  const { username } = req.params;
  const { roles } = req.body;

  const validRoles = ['admin', 'staff', 'user'];
  if (!Array.isArray(roles) || roles.some(role => !validRoles.includes(role))) {
    return res.status(400).json({ message: 'Invalid roles' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.roles = roles;
    await user.save();
    res.json({ message: 'User roles updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user roles', error: err.message });
  }
});

// Product schema and model
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
});

const Product = mongoose.model('Product', productSchema);

// Admin route to add product
app.post('/api/admin/products', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);

  const { name, description, price, stock } = req.body;
  try {
    const newProduct = new Product({ name, description, price, stock });
    await newProduct.save();
    res.status(201).json({ message: 'Product added' });
  } catch (err) {
    res.status(400).json({ message: 'Error adding product', error: err.message });
  }
});

// Staff route to manage products (update stock)
app.put('/api/staff/products/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'staff') return res.sendStatus(403);

  const { id } = req.params;
  const { stock } = req.body;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.stock = stock;
    await product.save();
    res.json({ message: 'Product stock updated' });
  } catch (err) {
    res.status(400).json({ message: 'Error updating product', error: err.message });
  }
});

// Delivery schema and model
const deliverySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
});

const Delivery = mongoose.model('Delivery', deliverySchema);

// Staff route to manage delivery
app.post('/api/staff/delivery', authenticateToken, async (req, res) => {
  if (req.user.role !== 'staff') return res.sendStatus(403);

  const { productId, quantity, status } = req.body;
  try {
    const newDelivery = new Delivery({ productId, quantity, status });
    await newDelivery.save();
    res.status(201).json({ message: 'Delivery created' });
  } catch (err) {
    res.status(400).json({ message: 'Error creating delivery', error: err.message });
  }
});

// Create default admin user if not exists
const createDefaultAdmin = async () => {
  const adminUser = await User.findOne({ username: 'admin' });
  if (!adminUser) {
    const defaultAdmin = new User({ username: 'admin', password: 'admin123', roles: ['admin'] });
    await defaultAdmin.save();
    console.log('Default admin user created: username=admin, password=admin123');
  }
};

mongoose.connection.once('open', () => {
  createDefaultAdmin();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

const userRoutes = require('./routes/user');

// Registration route for new users
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const newUser = new User({ username, password, roles: ['user'] });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error registering user', error: err.message });
  }
});

// Use user routes
app.use('/api/user', authenticateToken, userRoutes);
