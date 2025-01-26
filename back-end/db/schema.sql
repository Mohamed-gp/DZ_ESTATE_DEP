-- Enum tables
CREATE TYPE Role AS ENUM ('ADMIN', 'USER');
CREATE TYPE Provider AS ENUM ('GOOGLE', 'CREDENTIALS');

-- User Table
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phoneNumber TEXT,
    password TEXT NOT NULL,
    profile_image TEXT DEFAULT 'http://res.cloudinary.com/dyhllkjj1/image/upload/v1715439059/dblboyxypvtkaeebvpgr.jpg',
    role Role DEFAULT 'USER',
    provider Provider DEFAULT 'CREDENTIALS',
    username TEXT NOT NULL , 
    refreshToken TEXT
    
);

-- Subscriber Table
CREATE TABLE Subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Home Table
CREATE TABLE Homes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    guests INT NOT NULL, -- idk why we added it 
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    price FLOAT NOT NULL,
    category TEXT,
    rating FLOAT,
    longitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    wilaya TEXT,
    commune TEXT ,
    type TEXT , 
    
);

CREATE TABLE Pictures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    home_id INT REFERENCES Homes(id) ON DELETE CASCADE
);


-- Favorite Table
CREATE TABLE Favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    home_id INT REFERENCES Homes(id) ON DELETE CASCADE,
    favorited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- Reservation Table
CREATE TABLE Reservations (
    id SERIAL PRIMARY KEY,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    home_id INT REFERENCES Homes(id) ON DELETE CASCADE
);

-- Review Table
CREATE TABLE Reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment TEXT,
    rating FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    home_id INT REFERENCES Homes(id) ON DELETE CASCADE
);

-- Picture Table

-- Chat Table
CREATE TABLE Chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    picture TEXT
);

-- Message Table
CREATE TABLE Messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chat_id UUID REFERENCES Chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE
);

-- Many-to-Many Relationship for Chat Users
CREATE TABLE ChatUsers (
    chat_id UUID REFERENCES Chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    PRIMARY KEY (chat_id, user_id)
);
