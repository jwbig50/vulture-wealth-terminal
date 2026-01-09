-- Vulture Wealth Terminal - Local Database Initialization

CREATE DATABASE IF NOT EXISTS vulture_wealth;
USE vulture_wealth;

-- Create local user (no OAuth needed)
INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
VALUES ('local-user', 'Local User', 'local@localhost', 'local', 'admin', NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_openId ON users(openId);
CREATE INDEX IF NOT EXISTS idx_holdings_userId ON holdings(userId);
CREATE INDEX IF NOT EXISTS idx_watchlist_userId ON watchlist(userId);
CREATE INDEX IF NOT EXISTS idx_priceHistory_holdingId ON priceHistory(holdingId);
CREATE INDEX IF NOT EXISTS idx_financialData_holdingId ON financialData(holdingId);
CREATE INDEX IF NOT EXISTS idx_valuations_holdingId ON valuations(holdingId);
CREATE INDEX IF NOT EXISTS idx_allocations_userId ON allocations(userId);

-- Grant privileges
GRANT ALL PRIVILEGES ON vulture_wealth.* TO 'vulture_user'@'%';
FLUSH PRIVILEGES;
