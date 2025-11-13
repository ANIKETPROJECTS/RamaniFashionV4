# Ramani Fashion India E-Commerce

## Overview

Ramani Fashion India is a full-stack e-commerce web application specializing in traditional Indian sarees and ethnic wear. The platform provides a sophisticated shopping experience with features including product browsing, filtering, cart management, wishlist functionality, user authentication, order processing, and an integrated contact form with store location. Built with a modern tech stack, it combines elegant UI design with robust backend functionality to deliver a premium online shopping experience for traditional Indian fashion.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 13, 2025 - WhatsApp OTP Integration:**
- **Real OTP Service:** Replaced test OTP (123456) with actual WhatsApp OTP delivery using superfast.akst.in API
- **WhatsApp Service Module:** Created `server/whatsapp-service.ts` to handle OTP sending via WhatsApp Cloud API
- **Random OTP Generation:** System now generates secure random 6-digit OTPs for each login attempt
- **Template-based Messaging:** Uses pre-approved WhatsApp template "otpforcustomer" for OTP delivery
- **Error Handling:** Proper error handling with automatic OTP cleanup on delivery failure
- **Updated Files:** server/whatsapp-service.ts (new), server/routes.ts, client/src/components/LoginDialog.tsx
- **Impact:**
  - Customers receive OTP codes directly on WhatsApp instead of test codes
  - More secure authentication with randomly generated OTPs
  - Better user experience with instant WhatsApp delivery
  - Test OTP display removed from login dialog
- **Security:** API credentials stored as environment variables (WHATSAPP_API_KEY, WHATSAPP_PHONE_NUMBER_ID)
- **Architecture:** Dedicated WhatsApp service module with clean separation of concerns; send-otp endpoint generates OTP, saves to database, and sends via WhatsApp with rollback on failure

**November 13, 2025 - Customer OTP Login Flow Enhancement:**
- **Centralized Authentication System:** Created auth utility (`client/src/lib/auth.ts`) to manage JWT tokens and customer data
- **Event-Based Auth State:** Implemented custom event system to notify components when authentication state changes
- **Automatic Profile Redirect:** After successful OTP verification, customers are now automatically redirected to profile page
- **Smart Login Detection:** Profile/customer button now checks authentication status before showing login dialog
- **Customer Profile Creation:** New customers with only phone number can add optional details (name, email, DOB, address) in profile page
- **Persistent Login:** Customers remain logged in across sessions using JWT token stored in localStorage
- **Updated Files:** client/src/lib/auth.ts (new), client/src/components/LoginDialog.tsx, client/src/components/Header.tsx, client/src/pages/Profile.tsx
- **Impact:**
  - After entering correct OTP, customer profile is created/updated in MongoDB
  - Customer is logged in and redirected to profile page to complete optional details
  - Clicking profile button when already authenticated goes directly to profile
  - Authentication state updates across all components in real-time via event system
- **Architecture:** Auth utility provides single source of truth for authentication state; components subscribe to auth changes for reactive updates

**November 12, 2025 - Color Variant Image Display in Product Grids:**
- **Fixed Image Display Logic:** Updated all product grid views to prioritize images from `colorVariants[0].images` before falling back to legacy `images` array
- **Consistent Fallback Behavior:** Applied image resolution pattern: `product.colorVariants?.[0]?.images?.[0] || product.images?.[0] || "/placeholder.jpg"`
- **Updated Files:** NewArrivals.tsx, Products.tsx, TrendingCollection.tsx, Sale.tsx
- **Impact:**
  - All product grid views now consistently display the correct product images from color variants
  - Products with only color variant images (no legacy images array) now display properly
  - Maintains backward compatibility with products that still use legacy images array
- **Architecture:** All listing pages use ProductCard component which now properly resolves images from color variants first

**November 9, 2025 - Dynamic Price Ranges & Automatic Sale Filtering:**
- **Automatic Sale Detection:** Products with originalPrice > sellingPrice now automatically appear in sale section without manual isSale flag
- **Dynamic Price Range Filters:** Price sliders now automatically adjust based on actual product prices in database and active filters
- **New API Endpoint:** Added `/api/price-range` that calculates min/max prices based on filter context (isSale, isNew, isTrending, category, fabric, color, occasion, inStock)
- **Backend Sale Filtering:** Modified `/api/products` to support `isSale=true` query parameter using MongoDB `$expr` for server-side sale detection
- **Responsive Price Ranges:** Price sliders now update dynamically when filters change (removed `priceRangeInitialized` lock)
- **Updated Files:** server/routes.ts, Sale.tsx, Products.tsx, NewArrivals.tsx, TrendingCollection.tsx
- **Impact:** 
  - Sale page automatically shows all discounted products (12 products)
  - Price filters reflect actual database values (e.g., ₹100-₹6999 instead of hardcoded ₹0-₹50000)
  - Filters are context-aware: selecting a category updates price range to match available products in that category
- **Architecture:** Separate price range query with matching filter params ensures consistent filtering context across product and price range endpoints

**November 8, 2025 - Product Management Form Enhancement:**
- Added support for up to 5 product images (Main Image + 4 additional images)
- Enhanced product form with all MongoDB schema fields:
  - Image management: 5 separate image URL inputs instead of comma-separated
  - Product details: Added subcategory, pattern, workType fields
  - Product features: Added "Includes Blouse Piece" checkbox
  - Product specifications: Added fabricComposition, dimensions, weight, careInstructions, countryOfOrigin
- Auto-detection for sale products: Products automatically appear on sale page when selling price (price) < original price (originalPrice)
- Updated form state management to handle specifications object and multiple image fields
- All new fields include proper data-testid attributes for testing

**November 8, 2025 - Admin Dashboard Color Variety:**
- Updated AdminDashboard.tsx with varied colors: pink, purple, cyan cards; green revenue chart, blue orders chart, amber weekly sales chart
- Updated Analytics.tsx with diverse colors: purple customer growth, green/amber/red order status bars
- Replaced old product categories with actual categories from database (22 categories total)

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- Tailwind CSS for utility-first styling with custom design system

**UI Component System:**
- Shadcn UI component library (New York style variant) with Radix UI primitives
- Custom path aliases configured (`@/components`, `@/lib`, `@/hooks`, etc.)
- Comprehensive design system with pink/rose color palette targeting feminine, elegant aesthetic
- Responsive design with mobile-first approach

**Key Design Decisions:**
- **Component Structure:** Modular, reusable components (ProductCard, CategoryCard, OccasionCard, etc.) for consistent UI patterns
- **State Management:** React Query handles all server state, eliminating need for global state management library
- **Routing:** Wouter chosen over React Router for minimal bundle size and simple API
- **Styling Approach:** Tailwind CSS with custom CSS variables for theming, allowing easy color scheme modifications

**Pros:**
- Type safety throughout the application
- Optimistic updates and automatic cache invalidation with React Query
- Minimal bundle size with Vite and Wouter
- Highly customizable UI components

**Cons:**
- Shadcn UI requires copying components into codebase (not a package dependency)
- Wouter has fewer features than React Router (trade-off for size)

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js framework
- TypeScript for type safety
- MongoDB with Mongoose ODM for data persistence
- JWT-based authentication with bcryptjs for password hashing

**API Structure:**
- RESTful API design with resource-based endpoints
- Authentication middleware for protected routes
- Comprehensive product filtering, sorting, and pagination
- Session management with JWT tokens stored in localStorage

**Key Design Decisions:**
- **Database Choice:** MongoDB selected for flexible schema allowing product variation (different saree attributes)
- **Authentication Strategy:** JWT tokens provide stateless authentication, scalable across multiple servers
- **Data Models:** Mongoose schemas for Products, Users, Cart, Wishlist, Orders, and Addresses with proper indexing
- **API Organization:** Single routes.ts file registers all endpoints; simple for current scope but may need modularization as application grows

**Pros:**
- Flexible schema adapts to varying product attributes
- Stateless authentication enables horizontal scaling
- Text search indexing on product names and descriptions
- Efficient querying with MongoDB aggregation

**Cons:**
- No database migrations system (MongoDB is schema-less but application logic defines structure)
- Single routes file may become unwieldy as application grows
- No API versioning strategy currently implemented

### Data Models

**Core Schemas:**

1. **Product Schema:** Contains comprehensive saree details (name, description, price, images, category, fabric, color, occasion, specifications, stock management)

2. **User Schema:** Basic user information (name, email, hashed password, phone)

3. **Cart Schema:** References user and contains array of cart items with product references and quantities

4. **Wishlist Schema:** References user and array of product IDs

5. **Order Schema:** Complete order information including items, shipping address, payment method, order status, and timestamps

6. **Address Schema:** User shipping addresses with full details (name, phone, address components, address type)

**Indexing Strategy:**
- Text index on product name and description fields for search functionality
- Unique constraint on user email for authentication

### Authentication & Authorization

**Implementation:**
- JWT tokens generated on login/registration
- Tokens stored in browser localStorage
- Authorization header (`Bearer <token>`) sent with protected API requests
- Middleware validates tokens and attaches user information to requests
- Client-side route protection redirects to login when token missing

**Security Considerations:**
- Passwords hashed with bcryptjs before storage
- JWT secret configurable via environment variable
- Token expiration should be implemented (not currently in code)

**Alternative Considered:**
- Session-based authentication was considered but JWT chosen for stateless nature and better mobile app compatibility in future

### File Organization

**Project Structure:**
- `/client` - Frontend React application
- `/server` - Backend Express application  
- `/shared` - Shared TypeScript types/schemas (currently minimal usage)
- `/attached_assets` - Static assets including generated product images

**Build Process:**
- Vite builds frontend to `dist/public`
- esbuild bundles backend to `dist/index.js`
- Production server serves static files and API from single Node process

## External Dependencies

### Database
- **MongoDB:** Primary data store accessed via `MONGODB_URI` environment variable
- Connection pooling handled by Mongoose with cached connections in serverless environments
- Database seeding functionality available via seed.ts for initial product data

### UI Component Libraries
- **Radix UI:** Headless UI primitives for accessible components (accordions, dialogs, dropdowns, etc.)
- **Shadcn UI:** Pre-built component patterns built on Radix UI
- **Lucide React:** Icon library for consistent iconography

### Development Tools
- **Drizzle Kit:** Database migration toolkit configured for PostgreSQL (note: currently using MongoDB, Drizzle config may be vestigial or for future migration)
- **Replit Plugins:** Development banner, cartographer, and runtime error overlay for Replit environment

### Payment Processing
- Not currently implemented; code shows "cod" (Cash on Delivery) as payment method
- Payment gateway integration (Razorpay, Stripe) would be future addition

### Image Storage
- Currently using local file paths in `/attached_assets/generated_images`
- Production deployment would require cloud storage (S3, Cloudinary, etc.)

### Email Service
- Not currently implemented
- Order confirmations and transactional emails would require service like SendGrid or AWS SES

### Third-Party Services (Future Considerations)
- **Search:** Elasticsearch or Algolia for advanced product search
- **Analytics:** Google Analytics or Mixpanel for user behavior tracking
- **CDN:** Cloudflare or AWS CloudFront for asset delivery
- **Monitoring:** Sentry for error tracking