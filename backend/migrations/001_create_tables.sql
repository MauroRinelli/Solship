-- Create Database
CREATE DATABASE IF NOT EXISTS solship CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE solship;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Destinations Table
CREATE TABLE IF NOT EXISTS destinations (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'Italy',
    phone VARCHAR(20),
    email VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_name (name),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    destination_id VARCHAR(50) NOT NULL,
    tracking_number VARCHAR(100) UNIQUE,
    carrier VARCHAR(50) NOT NULL,
    status ENUM('pending', 'in-transit', 'delivered', 'cancelled', 'returned') DEFAULT 'pending',
    ship_date DATE NOT NULL,
    expected_delivery DATE,
    actual_delivery DATE,
    items TEXT,
    weight DECIMAL(10, 2),
    dimensions VARCHAR(50),
    cost DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'EUR',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_destination_id (destination_id),
    INDEX idx_tracking (tracking_number),
    INDEX idx_status (status),
    INDEX idx_ship_date (ship_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings Table (optional, for user preferences)
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    theme VARCHAR(20) DEFAULT 'light',
    currency VARCHAR(3) DEFAULT 'EUR',
    weight_unit VARCHAR(10) DEFAULT 'kg',
    dimension_unit VARCHAR(10) DEFAULT 'cm',
    language VARCHAR(10) DEFAULT 'it',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
