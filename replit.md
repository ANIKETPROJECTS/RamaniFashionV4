# Ramani Fashion India E-Commerce

## Overview

Ramani Fashion India is a full-stack e-commerce web application specializing in traditional Indian sarees and ethnic wear. The platform offers a sophisticated shopping experience with features such as product browsing, filtering, cart management, wishlist functionality, user authentication, order processing, review management, and an integrated contact form. The project includes a comprehensive admin panel for managing products, inventory, orders, customers, reviews, and analytics. The project aims to provide a premium online shopping experience for traditional Indian fashion, combining elegant UI design with robust backend functionality.

## Recent Changes

### December 1, 2025
- **Fixed Color Filter Visibility:** Resolved issue where the color filter was not visible on product grid pages (New Arrivals, Trending Collection, Sale):
  - Reordered filter sections to place Color filter immediately after Categories (before Price Range) for better visibility
  - Added scrollable sidebar with `max-h-[calc(100vh-6rem)] overflow-y-auto` to ensure all filter sections are accessible
  - Color filter dynamically shows colors extracted from currently displayed products using `extractUniqueColorsFromProducts` utility
  - Color swatches display as circular buttons with CSS color values mapped via `colorUtils.ts` (supports 50+ color names)

### November 18, 2025
- **Integrated Shiprocket Shipping Service:** Implemented complete shipping workflow with admin approval process:
  - Created Shiprocket service module with JWT authentication, token caching, and API integration
  - Added order approval/rejection endpoints requiring payment completion before approval
  - Enhanced Order schema with Shiprocket fields (order ID, shipment ID, AWB code, courier details)
  - Shiprocket order creation happens atomically with approval - orders only marked approved if Shiprocket integration succeeds
  - Admin UI displays approve/reject buttons for pending paid orders with Shiprocket tracking information
  - AWB assignment and pickup scheduling handled as non-critical operations
  - Proper error handling ensures data consistency between database and Shiprocket
- **Fixed Admin Panel Navigation:** Refactored Analytics component to use shared AdminLayout instead of duplicate sidebar, ensuring all navigation sections (Dashboard, Products, Inventory, Orders, Customers, Reviews) remain visible across all admin pages
- **Enhanced Real-Time Cache Synchronization:** Implemented cross-cache invalidation between admin panel and customer website for review operations:
  - Customer review submissions now instantly update admin review management panel
  - Admin review deletions now instantly reflect on product detail pages
  - Uses React Query cache invalidation with exact: false to match all pagination variants
  - Includes guards for edge cases (deleted products, null references)
- **Fixed Analytics Page:** Corrected API response handling to properly parse paginated customer and order data, preventing page crashes
- **Added Review Management:** Created comprehensive admin section for managing product reviews with:
  - Complete review details including product info, customer info, ratings, comments, and verification status
  - Search and filter functionality (by rating, verified purchases, sort options)
  - Delete functionality with confirmation dialogs
  - Pagination for large review datasets
  - Aggregate statistics showing total reviews, verified purchases count, overall average rating, and total helpful votes across the entire dataset (not just current page)
  - Server-side aggregate calculations to ensure accurate KPIs regardless of pagination
- **Fixed Review Rating Distribution Calculation:** Resolved issue where rating statistics (average rating, rating distribution) were showing incorrectly (all zeros) on product pages:
  - Changed from MongoDB aggregation pipeline to JavaScript-based calculation to avoid ObjectId type conversion issues
  - Now correctly displays rating breakdown (e.g., number of 5-star, 4-star reviews) in real-time
  - Statistics update immediately when new reviews are submitted without requiring page refresh
  - Performance remains optimal since the calculation only fetches rating fields from the database

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query for server state management. Styling is handled by Tailwind CSS, utilizing a custom design system and Shadcn UI (New York style variant) built on Radix UI primitives. Key design decisions include a modular component structure, React Query for server state, and a mobile-first responsive design with a pink/rose color palette for an elegant aesthetic.

### Backend Architecture

The backend uses Node.js with Express.js and TypeScript. MongoDB with Mongoose ODM serves as the data store. It features a RESTful API with JWT-based authentication using bcryptjs for password hashing. Key design decisions include MongoDB for its flexible schema, JWT for stateless authentication, and Mongoose schemas for core data models like Products, Users, Cart, Wishlist, Orders, and Addresses. The API supports comprehensive product filtering, sorting, and pagination. A dedicated WhatsApp service module handles OTP sending via WhatsApp Cloud API.

### Data Models

Core schemas include Product, User, Cart, Wishlist, Order, Address, and Review. Products include comprehensive details and support color variants. Reviews include customer ratings, comments, verification status, and helpful vote counts. Indexing strategy involves text indexes on product names/descriptions and a unique constraint on user email.

### Admin Panel Features

The admin panel includes dedicated sections for:
- **Dashboard/Analytics:** Overview of key metrics including revenue, orders, customers, and products with detailed charts and statistics
- **Product Management:** Create, edit, and delete products with inventory tracking
- **Inventory Management:** Real-time stock level monitoring and updates
- **Order Management:** View and manage customer orders with status updates
- **Customer Management:** View customer details and order history
- **Review Management:** Comprehensive review oversight with search, filtering, and moderation capabilities including aggregate statistics across all reviews

### Authentication & Authorization

JWT tokens are generated upon login/registration, stored in localStorage, and used for authorization via a Bearer token in API requests. Middleware validates tokens, and client-side routing protects authenticated routes. Passwords are hashed with bcryptjs.

### File Organization

The project is structured into `/client` (frontend), `/server` (backend), `/shared` (shared types), and `/attached_assets` (static assets). The build process uses Vite for the frontend and esbuild for the backend.

## External Dependencies

### Database

- **MongoDB:** Primary data store, accessed via `MONGODB_URI`. Mongoose handles connection pooling.

### UI Component Libraries

- **Radix UI:** Headless UI primitives.
- **Shadcn UI:** Pre-built components based on Radix UI.
- **Lucide React:** Icon library.

### Development Tools

- **Replit Plugins:** Development banner, cartographer, and runtime error overlay.

### Third-Party Services

- **WhatsApp Cloud API:** Used for sending OTPs for user authentication.
- **Shiprocket:** Shipping and logistics service for order fulfillment. Orders are sent to Shiprocket after admin approval. Provides AWB tracking codes, courier assignment, and pickup scheduling.

### Future Considerations (Not currently implemented)

- **Payment Processing:** Integration with gateways like Razorpay or Stripe.
- **Image Storage:** Cloud storage solutions such as S3 or Cloudinary.
- **Email Service:** For transactional emails (e.g., SendGrid, AWS SES).
- **Search:** Elasticsearch or Algolia for advanced search.
- **Analytics:** Google Analytics or Mixpanel.
- **CDN:** Cloudflare or AWS CloudFront for asset delivery.
- **Monitoring:** Sentry for error tracking.