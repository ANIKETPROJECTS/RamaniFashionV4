import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDB } from "./db";
import { Product, User, Cart, Wishlist, Order, Address, ContactSubmission, OTP } from "./models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "ramani-fashion-secret-key";
const ADMIN_JWT_SECRET = process.env.ADMIN_SESSION_SECRET || "ramani-admin-secret-key-2024";

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Middleware to verify admin JWT token
function authenticateAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  jwt.verify(token, ADMIN_JWT_SECRET, (err: any, admin: any) => {
    if (err) return res.status(403).json({ error: 'Invalid admin token' });
    if (admin.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.admin = admin;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Connect to MongoDB
  await connectDB();

  // Product Routes
  app.get("/api/products", async (req, res) => {
    try {
      const {
        category,
        fabric,
        color,
        occasion,
        minPrice,
        maxPrice,
        inStock,
        search,
        sort = 'createdAt',
        order = 'desc',
        page = '1',
        limit = '12'
      } = req.query;

      const query: any = {};

      // Handle multi-select filters (comma-separated values)
      if (category) {
        const categories = (category as string).split(',').filter(Boolean);
        query.category = categories.length > 1 ? { $in: categories } : categories[0];
      }
      if (fabric) {
        const fabrics = (fabric as string).split(',').filter(Boolean);
        query.fabric = fabrics.length > 1 ? { $in: fabrics } : fabrics[0];
      }
      if (color) {
        const colors = (color as string).split(',').filter(Boolean);
        query.color = colors.length > 1 ? { $in: colors } : colors[0];
      }
      if (occasion) {
        const occasions = (occasion as string).split(',').filter(Boolean);
        query.occasion = occasions.length > 1 ? { $in: occasions } : occasions[0];
      }
      
      if (inStock === 'true') query.inStock = true;
      if (req.query.isNew === 'true') query.isNew = true;
      if (req.query.isBestseller === 'true') query.isBestseller = true;
      if (req.query.isTrending === 'true') query.isTrending = true;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      if (search) {
        query.$text = { $search: search as string };
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const sortOrder = order === 'asc' ? 1 : -1;
      const sortObj: any = {};
      sortObj[sort as string] = sortOrder;

      const products = await Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await Product.countDocuments(query);

      res.json({
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).lean();
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Legacy product mutation routes - now protected with admin authentication
  app.post("/api/products", authenticateAdmin, async (req, res) => {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/products/:id", authenticateAdmin, async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", authenticateAdmin, async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone
      });

      await user.save();

      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);
      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);
      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // OTP Routes (Dummy Implementation)
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      // Delete any existing OTP for this phone number
      await OTP.deleteMany({ phone });

      // Generate dummy OTP (always 123456 for testing)
      const dummyOtp = "123456";
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const otp = new OTP({
        phone,
        otp: dummyOtp,
        expiresAt
      });

      await otp.save();

      // In production, you would send this OTP via SMS
      // For now, we return it in the response for testing
      res.json({ 
        message: 'OTP sent successfully',
        otp: dummyOtp // Remove this in production!
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
      }

      const otpRecord = await OTP.findOne({ phone, otp });

      if (!otpRecord) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      if (new Date() > otpRecord.expiresAt) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ error: 'OTP expired' });
      }

      // Delete the used OTP
      await OTP.deleteOne({ _id: otpRecord._id });

      res.json({ message: 'OTP verified successfully', verified: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await User.findById((req as any).user.userId).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cart Routes
  app.get("/api/cart", authenticateToken, async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: (req as any).user.userId })
        .populate('items.productId')
        .lean();
      res.json(cart || { items: [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cart", authenticateToken, async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      const userId = (req as any).user.userId;

      let cart = await Cart.findOne({ userId });
      
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      const existingItem = cart.items.find(
        (item: any) => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }

      cart.updatedAt = new Date();
      await cart.save();

      const populatedCart = await Cart.findById(cart._id).populate('items.productId');
      res.json(populatedCart);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/cart/:productId", authenticateToken, async (req, res) => {
    try {
      const { quantity } = req.body;
      const userId = (req as any).user.userId;
      const { productId } = req.params;

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const item = cart.items.find(
        (item: any) => item.productId.toString() === productId
      );

      if (!item) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }

      item.quantity = quantity;
      cart.updatedAt = new Date();
      await cart.save();

      const populatedCart = await Cart.findById(cart._id).populate('items.productId');
      res.json(populatedCart);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cart/:productId", authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { productId } = req.params;

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      cart.items = cart.items.filter(
        (item: any) => item.productId.toString() !== productId
      );
      cart.updatedAt = new Date();
      await cart.save();

      const populatedCart = await Cart.findById(cart._id).populate('items.productId');
      res.json(populatedCart);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Wishlist Routes
  app.get("/api/wishlist", authenticateToken, async (req, res) => {
    try {
      const wishlist = await Wishlist.findOne({ userId: (req as any).user.userId })
        .populate('products')
        .lean();
      res.json(wishlist || { products: [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/wishlist/:productId", authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { productId } = req.params;

      let wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        wishlist = new Wishlist({ userId, products: [] });
      }

      if (!wishlist.products.includes(productId as any)) {
        wishlist.products.push(productId as any);
        wishlist.updatedAt = new Date();
        await wishlist.save();
      }

      const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
      res.json(populatedWishlist);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/wishlist/:productId", authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { productId } = req.params;

      const wishlist = await Wishlist.findOne({ userId });
      if (!wishlist) {
        return res.status(404).json({ error: 'Wishlist not found' });
      }

      wishlist.products = wishlist.products.filter(
        (id: any) => id.toString() !== productId
      );
      wishlist.updatedAt = new Date();
      await wishlist.save();

      const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
      res.json(populatedWishlist);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Address Routes
  app.get("/api/addresses", authenticateToken, async (req, res) => {
    try {
      const addresses = await Address.find({ userId: (req as any).user.userId }).lean();
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/addresses", authenticateToken, async (req, res) => {
    try {
      const address = new Address({
        userId: (req as any).user.userId,
        ...req.body
      });

      if (req.body.isDefault) {
        await Address.updateMany(
          { userId: (req as any).user.userId },
          { isDefault: false }
        );
      }

      await address.save();
      res.status(201).json(address);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/addresses/:id", authenticateToken, async (req, res) => {
    try {
      if (req.body.isDefault) {
        await Address.updateMany(
          { userId: (req as any).user.userId },
          { isDefault: false }
        );
      }

      const address = await Address.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }

      res.json(address);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/addresses/:id", authenticateToken, async (req, res) => {
    try {
      const address = await Address.findByIdAndDelete(req.params.id);
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }
      res.json({ message: 'Address deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Order Routes
  app.get("/api/orders", authenticateToken, async (req, res) => {
    try {
      const orders = await Order.find({ userId: (req as any).user.userId })
        .sort({ createdAt: -1 })
        .lean();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/:id", authenticateToken, async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).lean();
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", authenticateToken, async (req, res) => {
    try {
      const orderNumber = 'RM' + Date.now();
      const order = new Order({
        userId: (req as any).user.userId,
        orderNumber,
        ...req.body
      });

      await order.save();

      // Clear cart after order
      await Cart.findOneAndUpdate(
        { userId: (req as any).user.userId },
        { items: [], updatedAt: new Date() }
      );

      res.status(201).json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get filter options
  app.get("/api/filters", async (req, res) => {
    try {
      const categories = await Product.distinct('category');
      const fabrics = await Product.distinct('fabric');
      const colors = await Product.distinct('color');
      const occasions = await Product.distinct('occasion');

      res.json({ categories, fabrics, colors, occasions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Contact Form Routes
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, mobile, email, subject, category, message } = req.body;

      if (!name || !mobile || !email || !subject || !category) {
        return res.status(400).json({ error: 'All required fields must be filled' });
      }

      const contactSubmission = new ContactSubmission({
        name,
        mobile,
        email,
        subject,
        category,
        message: message || ''
      });

      await contactSubmission.save();
      res.status(201).json({ 
        message: 'Contact form submitted successfully',
        submission: contactSubmission 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const submissions = await ContactSubmission.find()
        .sort({ createdAt: -1 })
        .lean();
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Authentication Routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Hardcoded admin credentials for now (TODO: move to database)
      const ADMIN_USERNAME = "admin@ramanifashion.com";
      const ADMIN_PASSWORD = "admin123";

      if (username !== ADMIN_USERNAME) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }

      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }

      const token = jwt.sign(
        { adminId: 'admin-1', username: ADMIN_USERNAME, role: 'admin' },
        ADMIN_JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        admin: { id: 'admin-1', username: ADMIN_USERNAME, role: 'admin' }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/verify", authenticateAdmin, async (req, res) => {
    res.json({ valid: true, admin: req.admin });
  });

  // Admin Product Management (protected)
  app.post("/api/admin/products", authenticateAdmin, async (req, res) => {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Analytics Routes
  app.get("/api/admin/analytics", authenticateAdmin, async (req, res) => {
    try {
      const totalProducts = await Product.countDocuments();
      const totalUsers = await User.countDocuments();
      const totalOrders = await Order.countDocuments();
      
      const orders = await Order.find().lean();
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      const lowStockProducts = await Product.countDocuments({ stockQuantity: { $lt: 10 } });
      const outOfStockProducts = await Product.countDocuments({ inStock: false });
      
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name email')
        .lean();

      const topProducts = await Product.find()
        .sort({ rating: -1 })
        .limit(5)
        .lean();

      res.json({
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        lowStockProducts,
        outOfStockProducts,
        recentOrders,
        topProducts
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/customers", authenticateAdmin, async (req, res) => {
    try {
      const customers = await User.find().select('-password').lean();
      
      const customersWithStats = await Promise.all(
        customers.map(async (customer) => {
          const orders = await Order.find({ userId: customer._id }).lean();
          const wishlist = await Wishlist.findOne({ userId: customer._id }).lean();
          
          return {
            ...customer,
            totalOrders: orders.length,
            totalSpent: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
            wishlistCount: wishlist?.products?.length || 0
          };
        })
      );

      res.json(customersWithStats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/orders", authenticateAdmin, async (req, res) => {
    try {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate('userId', 'name email phone')
        .lean();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/orders/:id/status", authenticateAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status, updatedAt: new Date() },
        { new: true }
      );
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/inventory", authenticateAdmin, async (req, res) => {
    try {
      const products = await Product.find()
        .select('name category stockQuantity inStock price images')
        .sort({ stockQuantity: 1 })
        .lean();
      
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/inventory/:id", authenticateAdmin, async (req, res) => {
    try {
      const { stockQuantity, inStock } = req.body;
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { stockQuantity, inStock, updatedAt: new Date() },
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
