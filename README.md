# MojoDojo - Premium Dessert Bakery

A complete web application for MojoDojo, a premium dessert bakery brand, featuring both public-facing website and private admin system.

## Features

### Public Website
- **Home Page**: Hero section with scroll animation, "Why MojoDojo" features, and "How It Works" ordering process
- **About Page**: Brand story and premium dessert philosophy
- **Reviews Page**: Customer testimonials and ratings
- **Contact Page**: Contact form with visible input borders
- **Order Page**: Complete product catalog with quantity selectors, product detail modals showing ingredients, and $100+ deposit notices
- **FAQ Page**: Common questions and answers

### Admin System
- **Role-Based Access Control**: Admin users get access to `/admin` dashboard
- **Product Management**: Add, edit, and manage dessert products
- **Order Management**: View and update order statuses
- **Inventory Management**: Track ingredient stock levels
- **Financial Overview**: Revenue and sales tracking
- **Worker View**: Simplified interface for kitchen staff
- **User Management**: Manage team member accounts

## Design System

### Color Palette (Premium Dark Theme)
- **Brand Black**: `#0a0a0a`
- **Brand Charcoal**: `#1a1a1a`
- **Brand Gold**: `#f4c430`
- **Brand Off-White**: `#f5f5f0`
- **Brand Light Gray**: `#9a9a9a`

### Key Features
- Mobile-first responsive design
- Glass effect UI elements
- Gold accent hover states
- Premium card styling with subtle gold borders
- Smooth animations using Motion (Framer Motion)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router 7 (Data Mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **Forms**: React Hook Form
- **Backend**: Supabase (Edge Functions with Hono server)
- **Database**: Supabase KV Store
- **Auth**: Supabase Auth with Email/Password and Google OAuth

## Authentication

### Default Admin Credentials
- **Email**: `admin@mojodojo.com`
- **Password**: `admin123`

### User Roles
- **Owner**: Full access to all admin features
- **Admin**: Access to admin dashboard and management features
- **Worker**: Access to simplified worker view
- **User**: Regular customer access

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── layouts/        # Layout components
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin dashboard pages
│   │   │   └── ...         # Public pages
│   │   ├── App.tsx         # Main app component
│   │   └── routes.tsx      # Route configuration
│   ├── lib/
│   │   ├── api.ts          # API client
│   │   └── supabase.ts     # Supabase types
│   ├── styles/
│   │   ├── index.css       # Main stylesheet
│   │   ├── mojodojo-theme.css  # Brand design system
│   │   └── ...
│   └── imports/            # Figma imported assets
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx   # Hono web server
│           └── kv_store.tsx  # KV database utilities
├── utils/
│   └── supabase/
│       └── info.tsx        # Supabase credentials
├── package.json
├── vite.config.ts
└── README.md
```

## API Endpoints

All endpoints are prefixed with `/make-server-44229999/`

### Public Endpoints
- `GET /products` - Get all products
- `GET /products/:id` - Get single product
- `POST /orders` - Create new order
- `GET /reviews` - Get all reviews
- `POST /reviews` - Submit a review

### Protected Endpoints (Require Auth)
- `POST /auth/signup` - Create new user
- `GET /auth/user` - Get current user
- `GET /orders` - Get all orders (admin)
- `PUT /orders/:id` - Update order status (admin)
- `POST /products` - Create/update product (admin)
- `GET /ingredients` - Get ingredients (admin)
- `PUT /ingredients/:id` - Update ingredient (admin)

## Products

### Initial Products
1. **Biscoff Cheesecake** ($15) - Individual slice
2. **Cheesecake Brownie Tray** ($25) - 12 pieces
3. **Tiramisu Tray** ($25) - 12 pieces

All products include:
- Product images (via figma:asset)
- Descriptions
- Serving size
- Allergy information
- Status (available/low_stock/preorder/sold_out)

## Development

### Install Dependencies
```bash
pnpm install
```

### Run Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

## Environment Variables

The following Supabase secrets are required:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

## Key Customizations

### Form Inputs
All form inputs have visible borders for better UX (changed from transparent to visible borders in dark theme).

### Login Modal
- Email login shown first
- Google OAuth button displayed below (disabled until configured)
- Responsive design for mobile and desktop

### Product Details
- Product detail modals show ingredients
- Deposit notices for orders $100+
- Visible +/- quantity buttons with proper contrast

### Navigation
- Sticky header with glass effect on scroll
- Profile dropdown with admin dashboard link for privileged users
- Mobile-responsive hamburger menu

## License

This project includes components from shadcn/ui (MIT License) and photos from Unsplash.

## Support

For questions or support, contact: hello@mojodojo.com

---

**Crafted with discipline, precision, and care.**
