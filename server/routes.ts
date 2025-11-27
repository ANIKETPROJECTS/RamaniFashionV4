import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDB } from "./db";
import { Product, User, Customer, Cart, Wishlist, Order, Address, ContactSubmission, OTP, Review, Settings } from "./models";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import XLSX from "xlsx";
import { upload } from "./upload-config";
import { sendWhatsAppOTP, generateOTP } from "./whatsapp-service";
import { phonePeService } from "./phonepe-service";
import { shiprocketService } from "./shiprocket.service";

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
        limit = '12',
        onSale
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
      
      // Filter for sale products
      if (onSale === 'true') {
        query.onSale = true;
      }
      
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

      // Special handling for discount sorting - use aggregation
      if (sort === 'discount') {
        const pipeline: any[] = [
          { $match: query },
          {
            $addFields: {
              discountPercent: {
                $cond: {
                  if: { $and: [
                    { $gt: ['$originalPrice', 0] },
                    { $ne: ['$originalPrice', null] }
                  ]},
                  then: {
                    $multiply: [
                      { $divide: [
                        { $subtract: ['$originalPrice', '$price'] },
                        '$originalPrice'
                      ]},
                      100
                    ]
                  },
                  else: 0
                }
              }
            }
          },
          { $sort: { discountPercent: sortOrder } },
          { $skip: skip },
          { $limit: limitNum }
        ];

        const products = await Product.aggregate(pipeline);
        const total = await Product.countDocuments(query);

        // Flatten products with color variants into separate cards
        const flattenedProducts = products.flatMap((product: any) => {
          if (product.colorVariants && product.colorVariants.length > 0) {
            return product.colorVariants.map((variant: any, index: number) => ({
              ...product,
              _id: `${product._id}_variant_${index}`,
              baseProductId: product._id,
              variantIndex: index,
              displayColor: variant.color,
              displayImages: variant.images && variant.images.length > 0 ? variant.images : product.images,
              variantStockQuantity: variant.stockQuantity,
              variantInStock: variant.inStock,
            }));
          }
          return [product];
        });

        res.json({
          products: flattenedProducts,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        });
      } else {
        // Normal sorting for other fields
        const sortObj: any = {};
        sortObj[sort as string] = sortOrder;

        const products = await Product.find(query)
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum)
          .lean();

        const total = await Product.countDocuments(query);

        // Flatten products with color variants into separate cards
        const flattenedProducts = products.flatMap((product: any) => {
          if (product.colorVariants && product.colorVariants.length > 0) {
            return product.colorVariants.map((variant: any, index: number) => ({
              ...product,
              _id: `${product._id}_variant_${index}`,
              baseProductId: product._id,
              variantIndex: index,
              displayColor: variant.color,
              displayImages: variant.images && variant.images.length > 0 ? variant.images : product.images,
              variantStockQuantity: variant.stockQuantity,
              variantInStock: variant.inStock,
            }));
          }
          return [product];
        });

        res.json({
          products: flattenedProducts,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      let productId = req.params.id;
      
      // Handle variant IDs (format: baseProductId_variant_index)
      if (productId.includes('_variant_')) {
        const parts = productId.split('_variant_');
        productId = parts[0]; // Extract the base product ID
      }
      
      const product = await Product.findById(productId).lean();
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // NOTE: Product mutations (create/update/delete) are now exclusively handled 
  // through the /api/admin/products endpoints with admin authentication.
  // Public access to products is read-only via GET /api/products and GET /api/products/:id

  // Review Routes
  app.get("/api/reviews/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const { page = '1', limit = '10', sort = 'createdAt', order = 'desc' } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;
      
      const sortOrder = order === 'asc' ? 1 : -1;
      const sortField = sort === 'rating' ? 'rating' : sort === 'helpful' ? 'helpful' : 'createdAt';
      
      const reviews = await Review.find({ productId })
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean();
      
      const total = await Review.countDocuments({ productId });
      
      // Calculate rating distribution by fetching all reviews for this product
      const allReviews = await Review.find({ productId }).select('rating').lean();
      
      const distribution = {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
      };
      
      allReviews.forEach((review: any) => {
        const rating = review.rating;
        if (rating >= 1 && rating <= 5) {
          distribution[rating as keyof typeof distribution]++;
        }
      });
      
      res.json({
        reviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        },
        ratingDistribution: distribution
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reviews", authenticateToken, async (req, res) => {
    try {
      const { productId, rating, title, comment } = req.body;
      const customerId = req.user.userId;
      
      // Verify this is a customer token (not admin)
      if (req.user.type !== 'customer') {
        return res.status(403).json({ error: 'Only registered customers can post reviews' });
      }
      
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(403).json({ error: 'Customer account not found' });
      }
      
      if (!productId || !rating || !title || !comment) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      
      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Check if customer already reviewed this product
      const existingReview = await Review.findOne({ productId, customerId });
      if (existingReview) {
        return res.status(400).json({ error: 'You have already reviewed this product' });
      }
      
      // Check if customer purchased this product (using correct field: orderStatus)
      const hasPurchased = await Order.findOne({
        userId: customerId,
        'items.productId': productId,
        orderStatus: { $in: ['delivered'] }
      });
      
      const review = new Review({
        productId,
        customerId,
        customerName: customer.name || 'Anonymous',
        rating,
        title,
        comment,
        verifiedPurchase: !!hasPurchased
      });
      
      await review.save();
      
      res.status(201).json(review);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/reviews/:reviewId/helpful", authenticateToken, async (req, res) => {
    try {
      const { reviewId } = req.params;
      const customerId = req.user.userId;
      
      // Verify this is a customer token (not admin)
      if (req.user.type !== 'customer') {
        return res.status(403).json({ error: 'Only registered customers can vote' });
      }
      
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(403).json({ error: 'Customer account not found' });
      }
      
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }
      
      // Check if customer already voted (convert ObjectIds to strings for comparison)
      const hasVoted = review.helpfulVotes && review.helpfulVotes.some(
        (voterId: any) => voterId.toString() === customerId.toString()
      );
      if (hasVoted) {
        return res.status(400).json({ error: 'You have already marked this review as helpful' });
      }
      
      // Add customer to helpful votes and increment counter
      review.helpfulVotes = review.helpfulVotes || [];
      review.helpfulVotes.push(customerId);
      review.helpful = review.helpfulVotes.length;
      await review.save();
      
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

      // Check if OTP was verified for this phone number
      const verifiedOtp = await OTP.findOne({ 
        phone, 
        verified: true,
        expiresAt: { $gt: new Date() }
      });

      if (!verifiedOtp) {
        return res.status(400).json({ error: 'Please verify your mobile number with OTP first' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        phoneVerified: true
      });

      await user.save();

      // Clean up the used OTP
      await OTP.deleteOne({ _id: verifiedOtp._id });

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
      const { email, password, phone } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if phone verification is required
      if (!user.phoneVerified) {
        if (!phone) {
          return res.status(400).json({ error: 'Please provide your mobile number and verify with OTP' });
        }

        // Verify that the provided phone matches the user's stored phone
        if (phone !== user.phone) {
          return res.status(400).json({ error: 'Phone number does not match your account' });
        }

        // Check if OTP was verified for this phone number
        const verifiedOtp = await OTP.findOne({ 
          phone, 
          verified: true,
          expiresAt: { $gt: new Date() }
        });

        if (!verifiedOtp) {
          return res.status(400).json({ error: 'Please verify your mobile number with OTP first' });
        }

        // Update user's phone verification status
        user.phoneVerified = true;
        await user.save();

        // Clean up the used OTP
        await OTP.deleteOne({ _id: verifiedOtp._id });
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

  // OTP Routes (WhatsApp Integration)
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      // Delete any existing OTP for this phone number
      await OTP.deleteMany({ phone });

      // Generate random 6-digit OTP
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database
      const otp = new OTP({
        phone,
        otp: otpCode,
        expiresAt
      });

      await otp.save();

      // Send OTP via WhatsApp
      try {
        await sendWhatsAppOTP({
          phoneNumber: phone,
          otp: otpCode
        });

        res.json({ 
          message: 'OTP sent successfully to WhatsApp'
        });
      } catch (whatsappError: any) {
        console.error('WhatsApp sending failed:', whatsappError);
        // Delete the saved OTP since sending failed
        await OTP.deleteOne({ _id: otp._id });
        
        return res.status(500).json({ 
          error: 'Failed to send OTP via WhatsApp. Please try again.' 
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phone, otp, notifyUpdates } = req.body;

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

      // Check if customer exists
      let customer = await Customer.findOne({ phone });
      
      if (!customer) {
        // Auto-create new customer
        customer = new Customer({
          phone,
          phoneVerified: true,
          notifyUpdates: notifyUpdates || false,
          lastLogin: new Date(),
        });
        await customer.save();
      } else {
        // Update existing customer verification status and last login
        customer.phoneVerified = true;
        customer.lastLogin = new Date();
        if (notifyUpdates !== undefined) {
          customer.notifyUpdates = notifyUpdates;
        }
        await customer.save();
      }

      // Clean up the used OTP
      await OTP.deleteOne({ _id: otpRecord._id });

      // Generate JWT token for customer
      const token = jwt.sign({ 
        userId: customer._id, 
        phone: customer.phone,
        type: 'customer'
      }, JWT_SECRET);

      res.json({ 
        message: 'OTP verified successfully', 
        verified: true,
        token,
        customer: { 
          id: customer._id, 
          phone: customer.phone,
          name: customer.name,
          email: customer.email
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const userType = (req as any).user.type || 'user';
      
      if (userType === 'customer') {
        const customer = await Customer.findById((req as any).user.userId);
        if (!customer) {
          return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
      } else {
        const user = await User.findById((req as any).user.userId).select('-password');
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/customer/profile", authenticateToken, async (req, res) => {
    try {
      const userType = (req as any).user.type;
      
      if (userType !== 'customer') {
        return res.status(403).json({ error: 'Only customers can update their profile' });
      }

      const { name, email, dob, address } = req.body;
      const customerId = (req as any).user.userId;

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Update optional fields
      if (name !== undefined) customer.name = name;
      if (email !== undefined) customer.email = email;
      if (dob !== undefined) customer.dob = dob ? new Date(dob) : undefined;
      if (address !== undefined) {
        customer.address = {
          street: address.street || customer.address?.street,
          city: address.city || customer.address?.city,
          state: address.state || customer.address?.state,
          pincode: address.pincode || customer.address?.pincode,
          landmark: address.landmark || customer.address?.landmark,
        };
      }

      customer.updatedAt = new Date();
      await customer.save();

      res.json({
        message: 'Profile updated successfully',
        customer: {
          id: customer._id,
          phone: customer.phone,
          name: customer.name,
          email: customer.email,
          dob: customer.dob,
          address: customer.address,
        }
      });
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
      
      if (!cart) {
        return res.json({ items: [] });
      }
      
      const cartWithColors = {
        ...cart,
        items: cart.items.map((item: any) => ({
          ...item,
          selectedColor: item.selectedColor ?? null
        }))
      };
      
      res.json(cartWithColors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cart", authenticateToken, async (req, res) => {
    try {
      const { productId, quantity = 1, selectedColor } = req.body;
      const userId = (req as any).user.userId;

      let cart = await Cart.findOne({ userId });
      
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      const existingItem = cart.items.find(
        (item: any) => {
          const productMatch = item.productId.toString() === productId;
          const colorMatch = (item.selectedColor || undefined) === (selectedColor || undefined);
          return productMatch && colorMatch;
        }
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, selectedColor });
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
      const { quantity, selectedColor } = req.body;
      const userId = (req as any).user.userId;
      const { productId } = req.params;

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const item = cart.items.find(
        (item: any) => {
          const productMatch = item.productId.toString() === productId;
          const colorMatch = (item.selectedColor || undefined) === (selectedColor || undefined);
          return productMatch && colorMatch;
        }
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
      const { selectedColor } = req.body;

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      cart.items = cart.items.filter(
        (item: any) => {
          const productMatch = item.productId.toString() === productId;
          const colorMatch = (item.selectedColor || undefined) === (selectedColor || undefined);
          return !(productMatch && colorMatch);
        }
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

  app.post("/api/payment/phonepe/initiate", authenticateToken, async (req, res) => {
    try {
      const { orderId, amount } = req.body;

      if (!orderId || !amount) {
        return res.status(400).json({ error: 'Order ID and amount are required' });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.userId.toString() !== (req as any).user.userId) {
        return res.status(403).json({ error: 'Unauthorized access to order' });
      }

      const merchantOrderId = order.orderNumber || `RM${Date.now()}`;
      const amountInPaisa = Math.round(amount * 100);
      
      // Use HOST_URL for production (custom domain) - MUST be https://ramanifashion.in
      const baseUrl = process.env.HOST_URL || 'https://ramanifashion.in';
      const redirectUrl = `${baseUrl}/payment-callback`;
      const callbackUrl = `${baseUrl}/api/payment/phonepe/webhook`;
      
      console.log('Payment initiation - Using baseUrl:', baseUrl, 'redirectUrl:', redirectUrl);

      const paymentResponse = await phonePeService.initiatePayment({
        merchantOrderId,
        amount: amountInPaisa,
        redirectUrl,
        callbackUrl,
        udf1: orderId,
        udf2: (req as any).user.userId,
      });

      if (!paymentResponse.success) {
        return res.status(500).json({ error: paymentResponse.error || 'Failed to initiate payment' });
      }

      await Order.findByIdAndUpdate(orderId, {
        phonePeMerchantOrderId: merchantOrderId,
        phonePeOrderId: paymentResponse.orderId,
        phonePePaymentState: paymentResponse.state,
        updatedAt: new Date(),
      });

      res.json({
        success: true,
        redirectUrl: paymentResponse.redirectUrl,
        orderId: paymentResponse.orderId,
        merchantOrderId,
      });
    } catch (error: any) {
      console.error('PhonePe payment initiation error:', error);
      res.status(500).json({ error: error.message || 'Failed to initiate payment' });
    }
  });

  app.get("/api/payment/phonepe/status/:merchantOrderId", authenticateToken, async (req, res) => {
    try {
      const { merchantOrderId } = req.params;

      const order = await Order.findOne({ phonePeMerchantOrderId: merchantOrderId });
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.userId.toString() !== (req as any).user.userId) {
        return res.status(403).json({ error: 'Unauthorized access to order' });
      }

      if (order.phonePePaymentState && (order.phonePePaymentState === 'COMPLETED' || order.phonePePaymentState === 'FAILED')) {
        return res.json({
          success: true,
          state: order.phonePePaymentState,
          orderId: order.phonePeOrderId,
          amount: order.total * 100,
          paymentDetails: order.phonePePaymentDetails || {},
        });
      }

      try {
        const statusResponse = await phonePeService.checkOrderStatus(merchantOrderId);

        if (statusResponse.success) {
          const paymentStatus = statusResponse.state === 'COMPLETED' ? 'paid' : 
                               statusResponse.state === 'FAILED' ? 'failed' : 'pending';
          
          await Order.findByIdAndUpdate(order._id, {
            phonePePaymentState: statusResponse.state,
            phonePePaymentDetails: statusResponse.paymentDetails,
            paymentStatus,
            orderStatus: paymentStatus === 'paid' ? 'processing' : order.orderStatus,
            updatedAt: new Date(),
          });

          return res.json({
            success: true,
            state: statusResponse.state,
            orderId: statusResponse.orderId,
            amount: statusResponse.amount,
            paymentDetails: statusResponse.paymentDetails,
          });
        }
      } catch (phonePeError) {
        console.error('PhonePe SDK error:', phonePeError);
      }

      return res.json({
        success: true,
        state: order.phonePePaymentState || 'PENDING',
        orderId: order.phonePeOrderId,
        amount: order.total * 100,
        paymentDetails: order.phonePePaymentDetails || {},
      });
    } catch (error: any) {
      console.error('PhonePe status check error:', error);
      res.status(500).json({ error: error.message || 'Failed to check payment status' });
    }
  });

  // PhonePe redirect callback after payment
  app.post("/payment-callback", async (req, res) => {
    try {
      // PhonePe sends the response in the response field (base64 encoded)
      const { response: base64Response } = req.body;
      
      let merchantOrderId = null;
      let paymentStatus = 'PENDING';

      if (base64Response) {
        try {
          const decodedResponse = Buffer.from(base64Response, 'base64').toString('utf-8');
          const paymentData = JSON.parse(decodedResponse);
          merchantOrderId = paymentData.merchantOrderId || paymentData.merchantTransactionId;
          paymentStatus = paymentData.state || 'PENDING';
          console.log('PhonePe callback received - Order ID:', merchantOrderId, 'Status:', paymentStatus);
        } catch (parseError) {
          console.error('Error parsing PhonePe response:', parseError);
        }
      }

      // Find the frontend base URL (use HOST_URL)
      const frontendUrl = process.env.HOST_URL || 'https://ramanifashion.in';

      // Redirect to /orders after successful payment
      return res.redirect(`${frontendUrl}/orders?paymentStatus=${paymentStatus}&merchantOrderId=${merchantOrderId}`);
    } catch (error: any) {
      console.error('Payment callback error:', error);
      const frontendUrl = process.env.HOST_URL || 'https://ramanifashion.in';
      res.redirect(`${frontendUrl}/orders?paymentStatus=error`);
    }
  });

  app.post("/api/payment/phonepe/webhook", async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const responseBody = JSON.stringify(req.body);

      const webhookUsername = process.env.PHONEPE_WEBHOOK_USERNAME || '';
      const webhookPassword = process.env.PHONEPE_WEBHOOK_PASSWORD || '';

      const validationResult = phonePeService.validateCallback(
        authHeader as string,
        responseBody,
        webhookUsername,
        webhookPassword
      );

      if (!validationResult.isValid) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }

      const callbackData = validationResult.data;
      
      if (callbackData && callbackData.merchantOrderId) {
        const order = await Order.findOne({ phonePeMerchantOrderId: callbackData.merchantOrderId });
        if (order) {
          const paymentStatus = callbackData.state === 'COMPLETED' ? 'paid' :
                               callbackData.state === 'FAILED' ? 'failed' : 'pending';
          
          await Order.findByIdAndUpdate(order._id, {
            phonePePaymentState: callbackData.state,
            phonePeTransactionId: callbackData.transactionId,
            phonePePaymentDetails: callbackData.paymentDetails,
            paymentStatus,
            orderStatus: paymentStatus === 'paid' ? 'processing' : order.orderStatus,
            updatedAt: new Date(),
          });
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('PhonePe webhook error:', error);
      res.status(500).json({ error: error.message || 'Webhook processing failed' });
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

  // Get dynamic price range based on filters
  app.get("/api/price-range", async (req, res) => {
    try {
      const {
        category,
        fabric,
        color,
        occasion,
        inStock,
        search,
        onSale
      } = req.query;

      const query: any = {};

      // Apply the same filters as the products endpoint
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
      
      // Filter for sale products
      if (onSale === 'true') {
        query.onSale = true;
      }
      
      if (search) {
        query.$text = { $search: search as string };
      }

      // Use aggregation to get min and max prices
      const result = await Product.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ]);

      const priceRange = result.length > 0 
        ? { minPrice: result[0].minPrice || 0, maxPrice: result[0].maxPrice || 0 }
        : { minPrice: 0, maxPrice: 0 };

      res.json(priceRange);
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

      // ⚠️ SECURITY WARNING: These credentials are hardcoded and should be moved to a secure database
      // TODO: URGENT - Move admin credentials to database with bcrypt password hashing
      // TODO: Add environment variables for sensitive configuration
      // TODO: Implement proper admin user management with role-based access control
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

  // Admin Image Upload Route
  app.post("/api/admin/upload-images", authenticateAdmin, (req, res) => {
    upload.array('images', 5)(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large (max 5MB per file)' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: 'Too many files (max 5 files)' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const files = req.files as Express.Multer.File[];
      const uploadedUrls = files.map(file => `/uploads/${file.filename}`);

      res.json({
        success: true,
        urls: uploadedUrls,
        message: `${files.length} file(s) uploaded successfully`
      });
    });
  });

  // Admin Inventory Management Route
  app.get("/api/admin/inventory", authenticateAdmin, async (req, res) => {
    try {
      const products = await Product.find()
        .select('name category stockQuantity inStock price')
        .sort({ stockQuantity: 1 })
        .lean();

      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/inventory/:id", authenticateAdmin, async (req, res) => {
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

  // Excel Import/Export Routes
  app.post("/api/admin/products/import", authenticateAdmin, (req, res) => {
    upload.single('file')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      try {
        // Read the Excel file
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Delete the uploaded file after reading
        fs.unlinkSync(req.file.path);

        // Validate and insert products
        const importedProducts = [];
        const errors = [];

        for (let i = 0; i < jsonData.length; i++) {
          try {
            const row: any = jsonData[i];
            
            // Map Excel columns to product fields
            const productData: any = {
              name: row.Name || row.name,
              description: row.Description || row.description || '',
              price: parseFloat(row.Price || row.price || 0),
              originalPrice: row['Original Price'] || row.originalPrice ? parseFloat(row['Original Price'] || row.originalPrice) : undefined,
              category: row.Category || row.category,
              subcategory: row.Subcategory || row.subcategory,
              fabric: row.Fabric || row.fabric,
              color: row.Color || row.color,
              occasion: row.Occasion || row.occasion,
              pattern: row.Pattern || row.pattern,
              workType: row['Work Type'] || row.workType,
              blousePiece: row['Blouse Piece'] === 'Yes' || row.blousePiece === true,
              sareeLength: row['Saree Length'] || row.sareeLength,
              stockQuantity: parseInt(row['Stock Quantity'] || row.stockQuantity || '0'),
              inStock: row['In Stock'] === 'Yes' || row.inStock === true || parseInt(row['Stock Quantity'] || row.stockQuantity || '0') > 0,
              isNew: row['Is New'] === 'Yes' || row.isNew === true,
              isBestseller: row['Is Bestseller'] === 'Yes' || row.isBestseller === true,
              isTrending: row['Is Trending'] === 'Yes' || row.isTrending === true,
            };

            // Handle images (comma-separated URLs)
            const imagesStr = row.Images || row.images || '';
            if (imagesStr) {
              productData.images = imagesStr.split(',').map((url: string) => url.trim()).filter(Boolean);
            }

            // Validate required fields
            if (!productData.name || !productData.category || !productData.price) {
              errors.push(`Row ${i + 2}: Missing required fields (Name, Category, or Price)`);
              continue;
            }

            const product = new Product(productData);
            await product.save();
            importedProducts.push(product);
          } catch (error: any) {
            errors.push(`Row ${i + 2}: ${error.message}`);
          }
        }

        res.json({
          success: true,
          imported: importedProducts.length,
          errors: errors,
          message: `Successfully imported ${importedProducts.length} products${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
  });

  app.get("/api/admin/products/export", authenticateAdmin, async (req, res) => {
    try {
      const products = await Product.find().lean();

      // Convert products to Excel format
      const excelData = products.map((product: any) => ({
        Name: product.name,
        Description: product.description,
        Price: product.price,
        'Original Price': product.originalPrice || '',
        Category: product.category,
        Subcategory: product.subcategory || '',
        Fabric: product.fabric || '',
        Color: product.color || '',
        Occasion: product.occasion || '',
        Pattern: product.pattern || '',
        'Work Type': product.workType || '',
        'Blouse Piece': product.blousePiece ? 'Yes' : 'No',
        'Saree Length': product.sareeLength || '',
        'Stock Quantity': product.stockQuantity || 0,
        'In Stock': product.inStock ? 'Yes' : 'No',
        'Is New': product.isNew ? 'Yes' : 'No',
        'Is Bestseller': product.isBestseller ? 'Yes' : 'No',
        'Is Trending': product.isTrending ? 'Yes' : 'No',
        Images: (product.images || []).join(', '),
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 30 }, // Name
        { wch: 50 }, // Description
        { wch: 10 }, // Price
        { wch: 12 }, // Original Price
        { wch: 20 }, // Category
        { wch: 20 }, // Subcategory
        { wch: 15 }, // Fabric
        { wch: 15 }, // Color
        { wch: 15 }, // Occasion
        { wch: 15 }, // Pattern
        { wch: 15 }, // Work Type
        { wch: 12 }, // Blouse Piece
        { wch: 15 }, // Saree Length
        { wch: 12 }, // Stock Quantity
        { wch: 10 }, // In Stock
        { wch: 10 }, // Is New
        { wch: 12 }, // Is Bestseller
        { wch: 12 }, // Is Trending
        { wch: 80 }, // Images
      ];
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename=products_export_${Date.now()}.xlsx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      res.send(buffer);
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

      // Monthly sales data for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const monthlyOrders = await Order.aggregate([
        {
          $match: { createdAt: { $gte: sixMonthsAgo } }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        }
      ]);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const salesData = monthlyOrders.map(item => ({
        month: monthNames[item._id.month - 1],
        revenue: Math.round(item.revenue),
        orders: item.orders
      }));

      // Category distribution
      const categoryStats = await Product.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 }
          }
        }
      ]);

      const totalProductsForPercentage = await Product.countDocuments();
      const categoryData = categoryStats.map((cat, index) => ({
        name: cat._id || 'Other',
        value: cat.count,
        percentage: totalProductsForPercentage > 0 ? Math.round((cat.count / totalProductsForPercentage) * 100) : 0
      }));

      // Weekly sales for last 4 weeks
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      
      const weeklyOrders = await Order.aggregate([
        {
          $match: { createdAt: { $gte: fourWeeksAgo } }
        },
        {
          $group: {
            _id: {
              week: { $week: "$createdAt" }
            },
            sales: { $sum: "$totalAmount" }
          }
        },
        {
          $sort: { "_id.week": 1 }
        }
      ]);

      const recentActivity = weeklyOrders.map((item, index) => ({
        month: `Week ${index + 1}`,
        sales: Math.round(item.sales)
      }));

      res.json({
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        lowStockProducts,
        outOfStockProducts,
        recentOrders,
        topProducts,
        salesData,
        categoryData,
        recentActivity
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/customers", authenticateAdmin, async (req, res) => {
    try {
      const {
        search,
        sort = 'createdAt',
        order = 'desc',
        page = '1',
        limit = '50'
      } = req.query;

      const query: any = {};

      // Search by phone, name, or email
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        query.$or = [
          { phone: searchRegex },
          { name: searchRegex },
          { email: searchRegex }
        ];
      }

      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 100); // Max 100 customers per page
      const skip = (pageNum - 1) * limitNum;

      // Build sort object
      const sortObj: any = {};
      sortObj[sort as string] = order === 'asc' ? 1 : -1;

      // Get total count for pagination
      const total = await Customer.countDocuments(query);

      // Fetch customers with pagination
      const customers = await Customer.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean();
      
      // Enhance customer data with detailed stats
      const customersWithDetails = await Promise.all(
        customers.map(async (customer) => {
          // Get orders (limit to recent 20 for stats calculation, show only 5 in response)
          const orders = await Order.find({ userId: customer._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
          
          // Get wishlist with limited product details (only essential fields)
          const wishlist: any = await Wishlist.findOne({ userId: customer._id })
            .populate({
              path: 'products',
              select: '_id name price images'
            })
            .lean();
          
          // Calculate stats
          const totalOrders = orders.length;
          const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
          const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
          const completedOrders = orders.filter(o => o.orderStatus === 'delivered').length;
          const wishlistProducts = (wishlist && Array.isArray(wishlist.products)) ? wishlist.products : [];
          
          return {
            _id: customer._id,
            phone: customer.phone,
            name: customer.name || '',
            email: customer.email || '',
            dob: customer.dob,
            address: customer.address,
            phoneVerified: customer.phoneVerified,
            notifyUpdates: customer.notifyUpdates,
            lastLogin: customer.lastLogin,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
            stats: {
              totalOrders,
              totalSpent,
              pendingOrders,
              completedOrders,
              wishlistCount: wishlistProducts.length
            },
            recentOrders: orders.slice(0, 5).map(order => ({
              orderId: order._id,
              orderNumber: order.orderNumber,
              total: order.total,
              status: order.orderStatus,
              paymentStatus: order.paymentStatus,
              createdAt: order.createdAt
            })),
            wishlistItems: wishlistProducts
          };
        })
      );

      res.json({
        customers: customersWithDetails,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/orders", authenticateAdmin, async (req, res) => {
    try {
      const {
        search,
        orderStatus,
        paymentStatus,
        startDate,
        endDate,
        sort = 'createdAt',
        order = 'desc',
        page = '1',
        limit = '20'
      } = req.query;

      const query: any = {};

      // Search by order number, customer name, email, or phone
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        
        // Find users matching the search
        const matchingUsers = await User.find({
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex }
          ]
        }).select('_id').lean();
        
        const userIds = matchingUsers.map(u => u._id);
        
        query.$or = [
          { orderNumber: searchRegex },
          { userId: { $in: userIds } }
        ];
      }

      // Filter by order status
      if (orderStatus) {
        const statuses = (orderStatus as string).split(',').filter(Boolean);
        query.orderStatus = statuses.length > 1 ? { $in: statuses } : statuses[0];
      }

      // Filter by payment status
      if (paymentStatus) {
        const statuses = (paymentStatus as string).split(',').filter(Boolean);
        query.paymentStatus = statuses.length > 1 ? { $in: statuses } : statuses[0];
      }

      // Filter by date range
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) {
          const endDateTime = new Date(endDate as string);
          endDateTime.setHours(23, 59, 59, 999);
          query.createdAt.$lte = endDateTime;
        }
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const sortOrder = order === 'asc' ? 1 : -1;
      const sortObj: any = {};
      sortObj[sort as string] = sortOrder;

      const orders = await Order.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name email phone')
        .lean();

      const total = await Order.countDocuments(query);

      res.json({
        orders,
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

  app.get("/api/admin/orders/:id", authenticateAdmin, async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('userId', 'name email phone')
        .populate('items.productId', 'name images')
        .lean();
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/orders/:id/approve", authenticateAdmin, async (req, res) => {
    console.log('\n=== ORDER APPROVAL STARTED ===');
    console.log('Order ID:', req.params.id);
    console.log('Admin:', req.admin.username);
    console.log('Timestamp:', new Date().toISOString());
    
    try {
      const order = await Order.findById(req.params.id).populate('userId', 'name email phone');
      
      if (!order) {
        console.error('❌ Order not found:', req.params.id);
        return res.status(404).json({ error: 'Order not found' });
      }

      console.log('Order found:', {
        orderNumber: order.orderNumber,
        approved: order.approved,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus
      });

      if (order.approved) {
        console.error('❌ Order already approved');
        return res.status(400).json({ error: 'Order already approved' });
      }

      if (order.paymentMethod !== 'cod' && order.paymentStatus !== 'paid') {
        console.error('❌ Payment not completed. Payment status:', order.paymentStatus);
        return res.status(400).json({ error: 'Prepaid orders must have payment completed before approval' });
      }

      const nameParts = order.shippingAddress.fullName.split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || '';

      const orderItems = order.items.map((item: any, index: number) => ({
        name: item.name,
        sku: `SKU-${item.productId || index}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 5208
      }));

      const totalWeight = order.items.reduce((sum: number, item: any) => sum + (item.quantity * 0.5), 0);

      const now = new Date();
      const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const shiprocketOrderData = {
        order_id: order.orderNumber,
        order_date: orderDate,
        pickup_location: "Primary",
        billing_customer_name: firstName,
        billing_last_name: lastName,
        billing_address: order.shippingAddress.address,
        billing_city: order.shippingAddress.city,
        billing_pincode: order.shippingAddress.pincode,
        billing_state: order.shippingAddress.state,
        billing_country: "India",
        billing_email: (order.userId as any).email || "customer@ramanifashion.com",
        billing_phone: order.shippingAddress.phone,
        shipping_is_billing: true,
        order_items: orderItems,
        payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
        sub_total: order.subtotal,
        length: 30,
        breadth: 25,
        height: 10,
        weight: totalWeight
      };

      console.log('\n📦 Sending order to Shiprocket:');
      console.log('Order Number:', shiprocketOrderData.order_id);
      console.log('Customer:', firstName, lastName);
      console.log('City:', shiprocketOrderData.billing_city);
      console.log('Pincode:', shiprocketOrderData.billing_pincode);
      console.log('Items:', orderItems.length);
      console.log('Payment Method:', shiprocketOrderData.payment_method);
      console.log('Weight:', totalWeight, 'kg');

      const shiprocketResponse = await shiprocketService.createOrder(shiprocketOrderData);
      
      console.log('\n✅ Shiprocket Response:');
      console.log('Order ID:', shiprocketResponse.order_id);
      console.log('Shipment ID:', shiprocketResponse.shipment_id);
      console.log('Status:', shiprocketResponse.status);

      order.approved = true;
      order.approvedBy = req.admin.username;
      order.approvedAt = new Date();
      order.orderStatus = 'processing';
      order.shiprocketOrderId = shiprocketResponse.order_id;
      order.shiprocketShipmentId = shiprocketResponse.shipment_id;
      order.updatedAt = new Date();
      
      await order.save();

      if (shiprocketResponse.shipment_id) {
        try {
          const awbResponse = await shiprocketService.assignAWB(shiprocketResponse.shipment_id);
          
          if (awbResponse.response?.data?.awb_code) {
            order.shiprocketAwbCode = awbResponse.response.data.awb_code;
            order.shiprocketCourierId = awbResponse.response.data.courier_company_id;
            order.shiprocketCourierName = awbResponse.response.data.courier_name;
            await order.save();

            try {
              await shiprocketService.schedulePickup(shiprocketResponse.shipment_id);
              console.log(`✅ Pickup scheduled for order ${order.orderNumber}`);
            } catch (pickupError: any) {
              console.error('Pickup scheduling failed (non-critical):', pickupError.message);
            }
          }
        } catch (awbError: any) {
          console.error('AWB assignment failed (non-critical):', awbError.message);
        }
      }

      console.log(`\n✅ Order ${order.orderNumber} approved and sent to Shiprocket`);
      console.log('=== ORDER APPROVAL COMPLETED ===\n');

      const populatedOrder = await Order.findById(order._id)
        .populate('userId', 'name email phone')
        .lean();

      res.json(populatedOrder);
    } catch (error: any) {
      console.error('\n❌ ORDER APPROVAL FAILED ===');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.error('=== END ERROR ===\n');
      res.status(500).json({ error: error.message || 'Failed to approve order and create shipment' });
    }
  });

  app.post("/api/admin/orders/:id/reject", authenticateAdmin, async (req, res) => {
    try {
      const { reason } = req.body;
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.approved) {
        return res.status(400).json({ error: 'Cannot reject an already approved order' });
      }

      if (order.orderStatus === 'cancelled') {
        return res.status(400).json({ error: 'Order is already cancelled' });
      }

      order.orderStatus = 'cancelled';
      order.rejectedBy = req.admin.username;
      order.rejectedAt = new Date();
      order.rejectionReason = reason || 'No reason provided';
      order.updatedAt = new Date();
      
      await order.save();

      const populatedOrder = await Order.findById(order._id)
        .populate('userId', 'name email phone')
        .lean();

      res.json(populatedOrder);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/orders/:id/status", authenticateAdmin, async (req, res) => {
    try {
      const { orderStatus, paymentStatus } = req.body;
      
      const validOrderStatuses = ['pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled'];
      const validPaymentStatuses = ['pending', 'paid', 'failed'];
      
      if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
        return res.status(400).json({ 
          error: `Invalid order status. Must be one of: ${validOrderStatuses.join(', ')}` 
        });
      }
      
      if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ 
          error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}` 
        });
      }
      
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (orderStatus === 'processing' || orderStatus === 'shipped' || orderStatus === 'delivered') {
        if (!order.approved) {
          return res.status(400).json({ 
            error: 'Order must be approved before it can be processed, shipped, or delivered' 
          });
        }
      }

      const updateData: any = { updatedAt: new Date() };
      
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;

      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('userId', 'name email phone');
      
      res.json(updatedOrder);
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

  app.get("/api/admin/reviews", authenticateAdmin, async (req, res) => {
    try {
      const {
        search,
        productId,
        rating,
        verifiedOnly,
        sort = 'createdAt',
        order = 'desc',
        page = '1',
        limit = '50'
      } = req.query;

      const query: any = {};

      if (productId) {
        query.productId = productId;
      }

      if (rating) {
        query.rating = parseInt(rating as string);
      }

      if (verifiedOnly === 'true') {
        query.verifiedPurchase = true;
      }

      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        query.$or = [
          { customerName: searchRegex },
          { title: searchRegex },
          { comment: searchRegex }
        ];
      }

      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 100);
      const skip = (pageNum - 1) * limitNum;

      const sortObj: any = {};
      sortObj[sort as string] = order === 'asc' ? 1 : -1;

      const total = await Review.countDocuments(query);

      const reviews = await Review.find(query)
        .populate('productId', 'name images category price')
        .populate('customerId', 'name email phone')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Calculate aggregate statistics across ALL matching reviews (not just current page)
      const allReviews = await Review.find(query).select('rating verifiedPurchase helpful').lean();
      const verifiedCount = allReviews.filter(r => r.verifiedPurchase).length;
      const avgRating = allReviews.length > 0 
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
        : 0;
      const totalHelpful = allReviews.reduce((sum, r) => sum + (r.helpful || 0), 0);

      res.json({
        reviews,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        },
        stats: {
          totalReviews: total,
          verifiedPurchases: verifiedCount,
          averageRating: avgRating,
          totalHelpfulVotes: totalHelpful
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/reviews/:id", authenticateAdmin, async (req, res) => {
    try {
      const review = await Review.findByIdAndDelete(req.params.id);
      
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Settings Routes
  app.get("/api/settings", async (req, res) => {
    try {
      let settings = await Settings.findOne();
      
      if (!settings) {
        settings = await Settings.create({
          shippingCharges: 0,
          freeShippingThreshold: 999
        });
      }
      
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/settings", authenticateAdmin, async (req, res) => {
    try {
      let settings = await Settings.findOne();
      
      if (!settings) {
        settings = await Settings.create({
          shippingCharges: 0,
          freeShippingThreshold: 999
        });
      }
      
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/settings", authenticateAdmin, async (req, res) => {
    try {
      const { shippingCharges, freeShippingThreshold } = req.body;
      
      if (shippingCharges !== undefined && shippingCharges < 0) {
        return res.status(400).json({ error: 'Shipping charges cannot be negative' });
      }
      
      if (freeShippingThreshold !== undefined && freeShippingThreshold < 0) {
        return res.status(400).json({ error: 'Free shipping threshold cannot be negative' });
      }
      
      let settings = await Settings.findOne();
      
      if (!settings) {
        settings = await Settings.create({
          shippingCharges: shippingCharges ?? 0,
          freeShippingThreshold: freeShippingThreshold ?? 999,
          updatedBy: req.admin.username,
          updatedAt: new Date()
        });
      } else {
        if (shippingCharges !== undefined) settings.shippingCharges = shippingCharges;
        if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = freeShippingThreshold;
        settings.updatedBy = req.admin.username;
        settings.updatedAt = new Date();
        await settings.save();
      }
      
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
