-- Enum Types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE user_provider AS ENUM ('credentials', 'google');
CREATE TYPE subscription_type AS ENUM ('free', 'premium');
CREATE TYPE property_sell_type AS ENUM ('sell', 'rent');
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'canceled');
CREATE TYPE payment_method AS ENUM ('stripe', 'chargily');
CREATE TYPE order_type AS ENUM ('rent', 'purchase');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'canceled');
CREATE TYPE property_asset_type AS ENUM ('image', 'video');



-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    provider user_provider DEFAULT 'credentials',
    profile_image TEXT DEFAULT 'https://www.gravatar.com/avatar/?d=mp',
    phone_number VARCHAR(50),
    password TEXT NOT NULL,
    role user_role DEFAULT 'user',
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE subscriptions (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type subscription_type NOT NULL DEFAULT 'free',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method NOT NULL,
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, updated_at)
);

-- Properties Table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(15, 2) NOT NULL CHECK (price > 0),
    status property_sell_type NOT NULL,
    commune VARCHAR(255),
    quartier VARCHAR(255),
    wilaya INT CHECK (wilaya BETWEEN 1 AND 58),
    longitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    guests INT NOT NULL CHECK (guests > 0),
    bedrooms INT NOT NULL CHECK (bedrooms > 0),
    bathrooms INT NOT NULL CHECK (bathrooms > 0),
    is_sponsored BOOLEAN DEFAULT FALSE,
    owner_id INT REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Features Table
CREATE TABLE features (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property Features Table (Many-to-Many Relationship)
CREATE TABLE property_features (
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    feature_id INT REFERENCES features(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, feature_id)
);

-- Property Assets Table
CREATE TABLE property_assets (
    id SERIAL ,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    asset_url TEXT NOT NULL,
    type property_asset_type DEFAULT 'image',
    PRIMARY KEY(id , property_id)
);

-- Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wishlists Table
CREATE TABLE wishlists (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, property_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations Table
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status payment_status DEFAULT 'pending',
    payment_method payment_method NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    order_type order_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    status order_status DEFAULT 'pending',
    payment_method payment_method NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscribers Table
CREATE TABLE subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms Table
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    user1_id INT REFERENCES users(id) ON DELETE SET NULL,
    user2_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room Pictures Table
CREATE TABLE room_pictures (
    id SERIAL ,
    room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id,room_id)
);

-- Messages Table
CREATE TABLE messages (
    id SERIAL,
    room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id , room_id)
);      

-- Performance Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_user_active ON subscriptions(user_id, is_active);
CREATE INDEX idx_properties_owner_sponsored ON properties(owner_id, is_sponsored);
CREATE INDEX idx_reservations_user_property ON reservations(user_id, property_id);
CREATE INDEX idx_orders_user_property ON orders(user_id, property_id);

