# Ramani Fashion India E-Commerce

## Overview

Ramani Fashion India is a full-stack e-commerce web application specializing in traditional Indian sarees and ethnic wear. The platform provides a sophisticated shopping experience with features including product browsing, filtering, cart management, wishlist functionality, user authentication, order processing, and an integrated contact form with store location. Built with a modern tech stack, it combines elegant UI design with robust backend functionality to deliver a premium online shopping experience for traditional Indian fashion.

## User Preferences

Preferred communication style: Simple, everyday language.

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