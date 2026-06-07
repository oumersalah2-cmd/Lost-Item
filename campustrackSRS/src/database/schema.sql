-- ============================================================
-- CampusTrack — Campus Lost & Found Management System
-- Database Schema
-- Owner: Eftiom Aseffa (Database Engineer)
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,  -- bcrypt hashed
    role        VARCHAR(20) DEFAULT 'user', -- 'user' or 'admin'
    is_active   BOOLEAN DEFAULT 1,      -- 1 = true, 0 = false
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  VARCHAR(100) NOT NULL UNIQUE
);

-- Items table (covers both lost and found)
CREATE TABLE IF NOT EXISTS items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL,
    type          VARCHAR(10) NOT NULL,     -- 'lost' or 'found'
    title         VARCHAR(150) NOT NULL,
    category_id   INTEGER NOT NULL,
    description   TEXT,
    location      VARCHAR(200),
    item_date     DATE NOT NULL,            -- date lost or found
    image_url     VARCHAR(300),
    status        VARCHAR(20) DEFAULT 'active', -- 'active', 'claimed', 'closed'
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    lost_item_id  INTEGER NOT NULL,
    found_item_id INTEGER NOT NULL,
    match_score   INTEGER NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lost_item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (found_item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    item_id     INTEGER NOT NULL,
    message     VARCHAR(255),
    is_read     BOOLEAN DEFAULT 0,          -- 0 = false, 1 = true
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Seed: default categories
INSERT OR IGNORE INTO categories (id, name) VALUES
(1, 'Electronics'),
(2, 'Documents & ID'),
(3, 'Keys'),
(4, 'Clothing & Accessories'),
(5, 'Books & Stationery'),
(6, 'Bags & Wallets'),
(7, 'Sports Equipment'),
(8, 'Other');
