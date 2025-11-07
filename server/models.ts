import mongoose, { Schema, Model } from 'mongoose';

// Product Schema
const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  images: [{ type: String }],
  category: { type: String, required: true },
  subcategory: { type: String },
  fabric: { type: String },
  color: { type: String },
  occasion: { type: String },
  pattern: { type: String },
  workType: { type: String },
  blousePiece: { type: Boolean, default: false },
  sareeLength: { type: String },
  inStock: { type: Boolean, default: true },
  stockQuantity: { type: Number, default: 0 },
  isNew: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  specifications: {
    fabricComposition: String,
    dimensions: String,
    weight: String,
    careInstructions: String,
    countryOfOrigin: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

productSchema.index({ name: 'text', description: 'text' });

// User Schema
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Address Schema
const addressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  address: { type: String, required: true },
  locality: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  landmark: { type: String },
  addressType: { type: String, enum: ['home', 'office'], default: 'home' },
  isDefault: { type: Boolean, default: false },
});

// Cart Schema
const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    addedAt: { type: Date, default: Date.now },
  }],
  updatedAt: { type: Date, default: Date.now },
});

// Wishlist Schema
const wishlistSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  updatedAt: { type: Date, default: Date.now },
});

// Order Schema
const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, required: true, unique: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
  }],
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    locality: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
  },
  subtotal: { type: Number, required: true },
  shippingCharges: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Export models
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Address = mongoose.models.Address || mongoose.model('Address', addressSchema);
export const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
