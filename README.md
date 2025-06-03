# 🏠 Property Rentals Platform

A modern, full-stack property rental platform built with Next.js, TypeScript, Node.js, and PostgreSQL. This platform allows users to list, search, and rent properties with integrated payment processing and real-time chat functionality.

## ✨ Features

### 🔍 Property Management

- **Advanced Search & Filtering**: Search by location, price range, category, and keywords
- **Image & Video Upload**: Multiple media upload with Cloudinary integration
- **Interactive Maps**: Location visualization with Leaflet
- **Property Reviews**: Rating and review system for properties

### 💳 Payment Integration

- **Stripe Integration**: Secure payment processing for bookings
- **Reservation System**: Date-based booking with availability checking
- **Transaction History**: Complete payment and booking records

### 👥 User Features

- **Authentication**: JWT-based secure login/registration
- **User Profiles**: Customizable user profiles with image upload
- **Wishlist**: Save favorite properties
- **Real-time Chat**: Socket.io powered messaging between users

### 🌐 Multi-language Support

- **i18n**: Support for English, French, and Arabic
- **RTL Support**: Right-to-left layout for Arabic

### 📊 Admin Dashboard

- **Analytics**: Property and user statistics
- **User Management**: Admin controls for user accounts
- **Content Moderation**: Review and approve listings

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Headless UI
- **Maps**: Leaflet/React-Leaflet
- **Forms**: React Hook Form with validation
- **State Management**: Zustand
- **Internationalization**: next-i18next

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT
- **File Upload**: Cloudinary
- **Payment**: Stripe
- **Real-time**: Socket.io
- **Email**: Nodemailer

### DevOps & Deployment

- **Containerization**: Docker & Docker Compose
- **Testing**: Jest for unit tests, Cypress for E2E
- **CI/CD**: GitHub Actions ready
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Production-ready configurations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Cloudinary account
- Stripe account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd property-rentals
```

### 2. Backend Setup

```bash
cd back-end
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your actual values

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd front-end
npm install

# Start development server
npm run dev
```

### 4. Using Docker (Recommended)

```bash
# From project root
docker-compose up -d
```

## ⚙️ Environment Configuration

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_PROD_URL=postgresql://user:pass@host:port/db
DATABASE_DEV_URL=postgresql://localhost:5432/property_rentals

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# Email (Gmail)
EMAIL=your-email@gmail.com
EMAIL_PASS_KEY=your-app-password

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 📁 Project Structure

```
property-rentals/
├── back-end/                 # Express.js API
│   ├── config/              # Database, Cloudinary, CORS configs
│   ├── controllers/         # Route handlers
│   ├── middlewares/         # Auth, error handling, validation
│   ├── routes/             # API routes
│   ├── db/                 # Database schema and migrations
│   ├── socket/             # Socket.io configuration
│   └── utils/              # Helper functions
├── front-end/              # Next.js application
│   ├── src/app/           # App router pages
│   ├── src/components/    # Reusable components
│   ├── src/store/         # Zustand store
│   ├── src/utils/         # Utility functions
│   └── public/            # Static assets
└── docker-compose.yml     # Docker orchestration
```

## 🗄️ Database Schema

### Core Tables

- **users**: User accounts and profiles
- **properties**: Property listings
- **property_assets**: Images and videos for properties
- **categories**: Property categories
- **features**: Property features/amenities
- **reviews**: Property ratings and reviews
- **reservations**: Booking records
- **chat_rooms**: Real-time messaging
- **subscribers**: Newsletter subscriptions

## 🔐 API Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Properties

- `GET /api/properties` - List properties with filters
- `POST /api/properties` - Create new property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Reservations

- `POST /api/reservations` - Create booking
- `GET /api/reservations` - Get user bookings
- `POST /api/stripe/create-checkout-session` - Payment processing

### Real-time Features

- Socket.io events for messaging
- Live notifications
- Real-time booking updates

## 🧪 Testing

### Backend Tests

```bash
cd back-end
npm test
```

### Frontend Tests

```bash
cd front-end
npm test
npm run cypress:open  # E2E tests
```

## 🚀 Deployment

### Production Environment Variables

Ensure all production environment variables are set:

- Database connection strings
- Cloudinary credentials
- Stripe production keys
- Secure JWT secrets
- Production domain URLs

### Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to cloud platforms
# The app is configured for deployment on:
# - Vercel (Frontend)
# - Railway/Render (Backend)
# - Supabase (Database)
```

### Database Migrations

```bash
# Run migrations in production
npm run migrate:prod
```

## 🔧 Development

### Code Quality

- ESLint and Prettier configured
- TypeScript strict mode enabled
- Git hooks for code formatting

### Adding New Features

1. Create feature branch
2. Add tests for new functionality
3. Update documentation
4. Submit pull request

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact: support@estatery.com

## 🔄 Changelog

### v1.0.0

- Initial release with core features
- Property listing and search functionality
- User authentication and profiles
- Payment integration with Stripe
- Real-time chat system
- Multi-language support

---

Built with ❤️ by the Estatery Team
