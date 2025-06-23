const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require('dns');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const dbUri = process.env.DB_URI;

dns.setDefaultResultOrder('ipv4first');

const app = express();
const port = 4998;

app.use(express.json());
app.use(cors());

const jwtSecret = process.env.JWT_SECRET || 'your-fallback-super-secret-jwt-key';

// User Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  createdAt: { type: Date, default: Date.now }
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
const User = mongoose.model('User', userSchema);

// Listing Model
const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  guests: { type: Number, required: true, min: 1 },
  bedrooms: { type: Number, required: true, min: 1 },
  beds: { type: Number, required: true, min: 1 },
  bathrooms: { type: Number, required: true, min: 1 },
  images: [{ type: String, required: true }],
  description: {
    main: { type: String, required: true },
    features: [{ icon: String, text: String }]
  },
  host: {
    name: { type: String, required: true },
    yearsHosting: { type: Number, required: true, min: 0 },
    avatar: { type: String }
  },
  rating: { type: Number, required: true, min: 0, max: 5 },
  reviews: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: '₹' },
  coordinates: {
    long: { type: Number, required: true },
    lat: { type: Number, required: true }
  }
}, { timestamps: true });
const Listing = mongoose.model('Listing', listingSchema);

// Booking Model
const bookingSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 }
}, { timestamps: true });
const Booking = mongoose.model('Booking', bookingSchema);

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    const verified = jwt.verify(token, jwtSecret);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token verification failed, authorization denied' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  console.log('Register request body:', { name: req.body.name, email: req.body.email });
  try {
    const { name, email, password } = req.body;
    const passwordRequirements = [
      { regex: /.{8,}/, message: 'Password must be at least 8 characters long.' },
      { regex: /[a-z]/, message: 'Password must contain at least one lowercase letter.' },
      { regex: /[A-Z]/, message: 'Password must contain at least one uppercase letter.' },
      { regex: /[0-9]/, message: 'Password must contain at least one number.' },
      { regex: /[^A-Za-z0-9]/, message: 'Password must contain at least one special character.' },
    ];
    for (const reqCheck of passwordRequirements) {
      if (!reqCheck.regex.test(password)) {
        return res.status(400).json({ message: reqCheck.message });
      }
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '24h' });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error, 'Request body:', { name: req.body.name, email: req.body.email });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '24h' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Booking Routes
app.post('/api/bookings', auth, async (req, res) => {
  try {
    const { listingId, startDate, endDate, guests } = req.body;
    const userId = req.user.userId;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(startDate) < today || new Date(endDate) < today) {
      return res.status(400).json({ message: 'Dates cannot be in the past' });
    }
    if (startDateObj > endDateObj) {
      return res.status(400).json({ message: 'Start date must be before or equal to end date' });
    }
    if (guests < 1 || guests > listing.guests) {
      return res.status(400).json({ message: `Guests must be between 1 and ${listing.guests}` });
    }
    const existingBookings = await Booking.find({
      listingId,
      startDate: { $lte: endDateObj },
      endDate: { $gte: startDateObj }
    });
    if (existingBookings.length > 0) {
      return res.status(409).json({ message: 'Already booked, kindly select different date(s)' });
    }
    const booking = new Booking({
      listingId,
      userId,
      startDate: startDateObj,
      endDate: endDateObj,
      guests
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const { listingId } = req.query;
    if (!listingId) return res.status(400).json({ message: 'listingId required' });
    const bookings = await Booking.find({ listingId });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Listing Routes
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await Listing.find();
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add POST /api/listings endpoint for storing listing information
app.post('/api/listings', async (req, res) => {
  try {
    const {
      title, location, city, bedrooms, beds, bathrooms, description,
      host, price, currency, coordinates, images
    } = req.body;
    // Validate required fields
    if (!title || !location || !city || !bedrooms || !beds || !bathrooms || !description || !host || !host.name || host.yearsHosting === undefined || !price || !currency || !coordinates || !images || !Array.isArray(images) || images.length !== 5) {
      return res.status(400).json({ message: 'Missing or invalid required fields' });
    }
    // Compose the description object for the current schema
    const descriptionObj = {
      main: description,
      features: []
    };
    // Compose the host object for the current schema
    const hostObj = {
      name: host.name,
      yearsHosting: host.yearsHosting,
    };
    // Add avatar if present
    if (host.avatar) {
      hostObj.avatar = host.avatar;
    }
    // Compose the listing object for the current schema
    const listing = new Listing({
      title,
      location,
      city,
      guests: 1, // Placeholder, since guests is required in schema but not in form
      bedrooms,
      beds,
      bathrooms,
      images,
      description: descriptionObj,
      host: hostObj,
      rating: 0, // Placeholder, since rating is required in schema but not in form
      reviews: 0, // Placeholder, since reviews is required in schema but not in form
      price,
      currency,
      coordinates
    });
    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a listing
app.put('/api/listings/:id', async (req, res) => {
  try {
    const update = req.body;
    // If description is a string, wrap it as { main: description, features: [] }
    if (typeof update.description === 'string') {
      update.description = { main: update.description, features: [] };
    }
    // If host is present, ensure avatar/name/yearsHosting are set
    if (update.host) {
      update.host = {
        name: update.host.name,
        yearsHosting: update.host.yearsHosting,
        avatar: update.host.avatar || ''
      };
    }
    const listing = await Listing.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a listing
app.delete('/api/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

let conn = null;
mongoose.connect(dbUri)
  .then((connection) => {
    conn = connection;
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
