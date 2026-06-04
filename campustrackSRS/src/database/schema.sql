-- ============================================================
-- CampusTrack — Campus Lost & Found Management System
-- Database Schema (Draft)
-- Owner: Eftiom Aseffa (Database Engineer)
-- ============================================================

-- ⚠️ This is a draft schema. To be finalized in Phase 2.

-- Users table
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,  -- bcrypt hashed
    role        ENUM('user', 'admin') DEFAULT 'user',
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(100) NOT NULL  -- e.g. Electronics, Documents, Keys, Clothing
);

-- Items table (covers both lost and found)
CREATE TABLE items (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    type          ENUM('lost', 'found') NOT NULL,
    title         VARCHAR(150) NOT NULL,
    category_id   INT NOT NULL,
    description   TEXT,
    location      VARCHAR(200),
    item_date     DATE NOT NULL,        -- date lost or found
    image_url     VARCHAR(300),
    status        ENUM('active', 'claimed', 'closed') DEFAULT 'active',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Notifications table
CREATE TABLE notifications (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    item_id     INT NOT NULL,
    message     VARCHAR(255),
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Seed: default categories
INSERT INTO categories (name) VALUES
('Electronics'),
('Documents & ID'),
('Keys'),
('Clothing & Accessories'),
('Books & Stationery'),
('Bags & Wallets'),
('Sports Equipment'),
('Other');
