-- Vulture Wealth Terminal - Database Initialization
-- This file is executed when the MySQL container starts for the first time

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS vulture_wealth;
USE vulture_wealth;

-- Grant privileges to the application user
GRANT ALL PRIVILEGES ON vulture_wealth.* TO 'vulture_user'@'%';
FLUSH PRIVILEGES;

-- Create indexes for better performance
CREATE INDEX idx_users_openId ON users(openId);
CREATE INDEX idx_holdings_userId ON holdings(userId);
CREATE INDEX idx_watchlist_userId ON watchlist(userId);
CREATE INDEX idx_priceHistory_holdingId ON priceHistory(holdingId);
CREATE INDEX idx_financialData_holdingId ON financialData(holdingId);
CREATE INDEX idx_valuations_holdingId ON valuations(holdingId);
CREATE INDEX idx_allocations_userId ON allocations(userId);

-- Create views for common queries
CREATE VIEW user_portfolio_summary AS
SELECT 
    u.id,
    u.name,
    COUNT(DISTINCT h.id) as holding_count,
    SUM(h.currentValue) as total_portfolio_value,
    AVG(h.costBasis) as avg_cost_basis
FROM users u
LEFT JOIN holdings h ON u.id = h.userId
GROUP BY u.id, u.name;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE get_portfolio_performance(IN userId INT)
BEGIN
    SELECT 
        h.id,
        h.ticker,
        h.shares,
        h.costBasis,
        h.currentValue,
        (h.currentValue - h.costBasis) as unrealized_gain,
        ((h.currentValue - h.costBasis) / h.costBasis * 100) as gain_percentage
    FROM holdings h
    WHERE h.userId = userId
    ORDER BY h.currentValue DESC;
END //

CREATE PROCEDURE get_watchlist_with_valuations(IN userId INT)
BEGIN
    SELECT 
        w.id,
        w.ticker,
        w.name,
        w.currentPrice,
        v.intrinsicValue,
        v.marginOfSafety,
        v.vulture_status,
        w.addedAt
    FROM watchlist w
    LEFT JOIN valuations v ON w.ticker = v.ticker
    WHERE w.userId = userId
    ORDER BY w.addedAt DESC;
END //

DELIMITER ;

-- Enable event scheduler for automatic tasks (optional)
SET GLOBAL event_scheduler = ON;

-- Create event for daily cleanup (optional)
CREATE EVENT IF NOT EXISTS daily_cleanup
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  DELETE FROM priceHistory 
  WHERE createdAt < DATE_SUB(NOW(), INTERVAL 5 YEAR);

-- Log initialization
INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
VALUES ('system-init', 'System', 'system@vulture.local', 'system', 'admin', NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Verify tables were created
SELECT 'Database initialization complete' as status;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'vulture_wealth';
